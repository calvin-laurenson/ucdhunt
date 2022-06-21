import json
from typing import TypedDict
import requests
from os import environ

CLOUDFLARE_ACCOUNT_ID = environ.get("CLOUDFLARE_ACCOUNT_ID")
CLOUDFLARE_API_KEY = environ.get("CLOUDFLARE_API_KEY")
CLOUDFLARE_BASE_IMAGE_URL = environ.get("CLOUDFLARE_BASE_IMAGE_URL")


def get_dcu_link(metadata: dict) -> tuple[str, str]:
    resp = requests.post(
        f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/images/v2/direct_upload",
        headers={"Authorization": f"Bearer {CLOUDFLARE_API_KEY}"},
        files={"metadata": json.dumps(metadata)},
    )
    resp_json = resp.json()
    assert resp_json["success"] == True
    return resp_json["result"]["uploadURL"], resp_json["result"]["id"]


class ImageInfo(TypedDict):
    metadata: dict | None
    draft: bool


def get_image_info(image_id) -> ImageInfo:
    resp = requests.get(
        f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/images/v1/{image_id}",
        headers={"Authorization": f"Bearer {CLOUDFLARE_API_KEY}"},
    )
    assert resp.status_code == 200
    resp_json = resp.json()
    assert resp_json["success"] == True
    print(resp_json)
    return {
        "draft": resp_json["result"].get("draft", False),
        "metadata": resp_json["result"].get("meta"),
    }

def make_image_url(image_id: str, variant: str = "public") -> str:
    return f"{CLOUDFLARE_BASE_IMAGE_URL}{image_id}/{variant}"