#!/usr/bin/env python3

import socket
import sys
import time
from pathlib import Path


host, port, request_path, ready_path, release_path, output_path = sys.argv[1:]

with socket.create_connection((host, int(port)), timeout=5) as connection:
    connection.settimeout(30)
    connection.sendall(
        f"GET {request_path} HTTP/1.1\r\nHost: {host}\r\nConnection: close\r\n\r\n".encode()
    )

    response = bytearray()
    while b"\r\n\r\n" not in response:
        chunk = connection.recv(65_536)
        if not chunk:
            raise RuntimeError("connection closed before response headers")
        response.extend(chunk)

    header_bytes, body = response.split(b"\r\n\r\n", 1)
    header_lines = header_bytes.decode("iso-8859-1").split("\r\n")
    if not header_lines[0].startswith("HTTP/1.1 200"):
        raise RuntimeError(f"unexpected response status: {header_lines[0]}")

    content_length = next(
        int(line.split(":", 1)[1].strip())
        for line in header_lines[1:]
        if line.lower().startswith("content-length:")
    )

    with open(output_path, "wb") as output:
        output.write(body)
        while output.tell() < 65_536:
            chunk = connection.recv(65_536)
            if not chunk:
                raise RuntimeError("connection closed before the response barrier")
            output.write(chunk)
        output.flush()
        Path(ready_path).touch()

        while not Path(release_path).exists():
            time.sleep(0.01)

        while output.tell() < content_length:
            chunk = connection.recv(1_048_576)
            if not chunk:
                raise RuntimeError(
                    f"response truncated: expected {content_length} bytes, got {output.tell()}"
                )
            output.write(chunk)

        if output.tell() != content_length:
            raise RuntimeError(
                f"response exceeded content length: expected {content_length} bytes, got {output.tell()}"
            )
