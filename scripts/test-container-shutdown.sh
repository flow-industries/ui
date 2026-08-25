#!/bin/sh
set -eu

stop_timeout_seconds=20
fixture_repetitions=40
target_platform="${TARGET_PLATFORM:-linux/amd64}"
run_id="$$"
image="flow-ui-shutdown-test:${run_id}"
container="flow-ui-shutdown-test-${run_id}"
temporary_directory="$(mktemp -d)"
download_pid=""
stop_pid=""

cleanup() {
  if [ -n "$download_pid" ]; then
    kill "$download_pid" 2>/dev/null || true
  fi
  if [ -n "$stop_pid" ]; then
    kill "$stop_pid" 2>/dev/null || true
  fi
  docker rm --force "$container" >/dev/null 2>&1 || true
  docker image rm "$image" >/dev/null 2>&1 || true
  rm -rf "$temporary_directory"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

docker build --platform "$target_platform" --tag "$image" .

stop_signal="$(docker image inspect --format '{{.Config.StopSignal}}' "$image")"
if [ "$stop_signal" != "SIGQUIT" ]; then
  echo "expected image stop signal SIGQUIT, got $stop_signal" >&2
  exit 1
fi

docker run \
  --detach \
  --name "$container" \
  --platform "$target_platform" \
  --publish 127.0.0.1::3000 \
  "$image" >/dev/null
port_mapping="$(docker port "$container" 3000/tcp)"
port="${port_mapping##*:}"
base_url="http://127.0.0.1:${port}"

ready=false
attempt=0
while [ "$attempt" -lt 50 ]; do
  if curl --fail --silent --max-time 1 "$base_url/health" >/dev/null; then
    ready=true
    break
  fi
  attempt=$((attempt + 1))
  sleep 0.1
done
if [ "$ready" != true ]; then
  echo "container did not become healthy" >&2
  docker logs "$container" >&2
  exit 1
fi

asset_info="$(docker exec "$container" sh -c '
  for file in /usr/share/nginx/html/assets/*.js; do
    size=$(wc -c < "$file")
    printf "%s %s\n" "$size" "${file##*/}"
  done | sort -nr | head -1
')"
asset_name="${asset_info#* }"
source_asset="/usr/share/nginx/html/assets/$asset_name"
drain_asset="/usr/share/nginx/html/assets/shutdown-drain.js"
docker exec "$container" sh -c '
  source_asset=$1
  drain_asset=$2
  repetitions=$3
  : > "$drain_asset"
  while [ "$repetitions" -gt 0 ]; do
    cat "$source_asset" >> "$drain_asset"
    repetitions=$((repetitions - 1))
  done
' sh "$source_asset" "$drain_asset" "$fixture_repetitions"
asset_name="${drain_asset##*/}"
asset_size="$(docker exec "$container" sh -c 'wc -c < "$1"' sh "$drain_asset" | tr -d ' ')"
download="$temporary_directory/$asset_name"
ready_file="$temporary_directory/ready"
release_file="$temporary_directory/release"

python3 scripts/download-with-barrier.py \
  127.0.0.1 \
  "$port" \
  "/assets/$asset_name" \
  "$ready_file" \
  "$release_file" \
  "$download" &
download_pid=$!

partial=false
attempt=0
while [ "$attempt" -lt 50 ]; do
  downloaded_size=0
  if [ -f "$download" ]; then
    downloaded_size="$(wc -c < "$download" | tr -d ' ')"
  fi
  if [ -f "$ready_file" ] && [ "$downloaded_size" -lt "$asset_size" ]; then
    partial=true
    break
  fi
  if ! kill -0 "$download_pid" 2>/dev/null; then
    break
  fi
  attempt=$((attempt + 1))
  sleep 0.1
done
if [ "$partial" != true ]; then
  echo "response was not in flight before shutdown: downloaded $downloaded_size of $asset_size bytes" >&2
  exit 1
fi

started_at="$(date +%s)"
docker stop --timeout "$stop_timeout_seconds" "$container" >"$temporary_directory/stop.out" &
stop_pid=$!

accepting=true
attempt=0
while [ "$attempt" -lt 50 ]; do
  if ! curl --silent --max-time 0.5 "$base_url/health" >/dev/null 2>&1; then
    accepting=false
    break
  fi
  attempt=$((attempt + 1))
  sleep 0.1
done
if [ "$accepting" = true ]; then
  echo "container continued accepting new requests during shutdown" >&2
  exit 1
fi

: > "$release_file"
if ! wait "$download_pid"; then
  download_pid=""
  echo "in-flight static response was interrupted" >&2
  docker logs "$container" >&2
  exit 1
fi
download_pid=""

if ! wait "$stop_pid"; then
  stop_pid=""
  echo "docker stop failed" >&2
  exit 1
fi
stop_pid=""
elapsed_seconds=$(( $(date +%s) - started_at ))

downloaded_size="$(wc -c < "$download" | tr -d ' ')"
if [ "$downloaded_size" -ne "$asset_size" ]; then
  echo "in-flight response was truncated: expected $asset_size bytes, got $downloaded_size" >&2
  exit 1
fi

exit_code="$(docker inspect --format '{{.State.ExitCode}}' "$container")"
if [ "$exit_code" -ne 0 ]; then
  echo "container exited with code $exit_code" >&2
  docker logs "$container" >&2
  exit 1
fi
if [ "$elapsed_seconds" -ge "$stop_timeout_seconds" ]; then
  echo "container exceeded the ${stop_timeout_seconds}s shutdown budget" >&2
  exit 1
fi

echo "graceful shutdown drained $asset_name ($asset_size bytes) in ${elapsed_seconds}s"
