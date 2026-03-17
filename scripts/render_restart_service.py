import json
import os
import sys
import urllib.error
import urllib.request


API_BASE = "https://api.render.com/v1"


def env(name: str, default: str | None = None) -> str | None:
    value = os.getenv(name, default)
    return value.strip() if isinstance(value, str) else value


def request_json(url: str, method: str = "GET", headers: dict[str, str] | None = None) -> tuple[int, dict | str]:
    req = urllib.request.Request(url=url, method=method, headers=headers or {})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            body = response.read().decode("utf-8", errors="replace")
            if body:
                try:
                    return response.status, json.loads(body)
                except json.JSONDecodeError:
                    return response.status, body
            return response.status, {}
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        try:
            return exc.code, json.loads(body)
        except json.JSONDecodeError:
            return exc.code, body


def http_probe(url: str, timeout: int) -> bool:
    try:
        req = urllib.request.Request(url=url, method="GET")
        with urllib.request.urlopen(req, timeout=timeout) as response:
            return 200 <= response.status < 400
    except Exception:
        return False


def restart_service(api_key: str, service_id: str) -> int:
    headers = {"Authorization": f"Bearer {api_key}"}
    status, body = request_json(f"{API_BASE}/services/{service_id}/restart", method="POST", headers=headers)
    print(f"Restart request status: {status}")
    print(body)
    return 0 if 200 <= status < 300 else 1


def main() -> int:
    api_key = env("RENDER_API_KEY")
    service_id = env("TARGET_SERVICE_ID")
    healthcheck_url = env("TARGET_SERVICE_URL")
    restart_mode = env("RESTART_MODE", "on_failure")
    probe_timeout = int(env("HEALTH_TIMEOUT_SECONDS", "20") or "20")

    if not api_key:
      print("Missing RENDER_API_KEY", file=sys.stderr)
      return 1
    if not service_id:
      print("Missing TARGET_SERVICE_ID", file=sys.stderr)
      return 1

    if restart_mode not in {"always", "on_failure"}:
      print("RESTART_MODE must be 'always' or 'on_failure'", file=sys.stderr)
      return 1

    if restart_mode == "always":
        print("RESTART_MODE=always, restarting target service unconditionally.")
        return restart_service(api_key, service_id)

    if not healthcheck_url:
        print("TARGET_SERVICE_URL is required when RESTART_MODE=on_failure", file=sys.stderr)
        return 1

    is_healthy = http_probe(healthcheck_url, probe_timeout)
    print(f"Health probe for {healthcheck_url}: {'healthy' if is_healthy else 'unhealthy'}")

    if is_healthy:
        return 0

    return restart_service(api_key, service_id)


if __name__ == "__main__":
    raise SystemExit(main())
