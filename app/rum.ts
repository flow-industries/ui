import { openobserveLogs } from "@openobserve/browser-logs";
import { openobserveRum } from "@openobserve/browser-rum";

const SITE = "observe.flow.industries";
const ORG = "default";
const SERVICE = "ui";
const ENV = import.meta.env.PROD ? "production" : "development";

let initialized = false;

export function initRum(clientToken: string, version = "dev") {
  if (typeof window === "undefined") return;
  if (initialized) return;
  if (!clientToken) return;

  openobserveRum.init({
    applicationId: SERVICE,
    clientToken,
    site: SITE,
    organizationIdentifier: ORG,
    service: SERVICE,
    env: ENV,
    version,
    apiVersion: "v1",
    insecureHTTP: false,
    trackResources: true,
    trackLongTasks: true,
    trackUserInteractions: true,
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100,
    defaultPrivacyLevel: "mask-user-input",
  });

  openobserveLogs.init({
    clientToken,
    site: SITE,
    organizationIdentifier: ORG,
    service: SERVICE,
    env: ENV,
    version,
    apiVersion: "v1",
    insecureHTTP: false,
    forwardErrorsToLogs: true,
  });

  initialized = true;
}
