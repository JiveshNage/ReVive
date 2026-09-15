import hashlib
from typing import Any


def format_passport_id(lot_id: int) -> str:
    """Format canonical passport identifier for a lot."""
    return f"REV-2026-LOT-{lot_id:04d}"


def generate_lot_reference(lot_id: int) -> str:
    """Format human-readable reference for a scrap lot."""
    return f"LOT-{lot_id:05d}"


def generate_handover_reference(handover_id: int) -> str:
    """Format human-readable reference for a handover confirmation."""
    return f"HND-{handover_id:05d}"


def generate_lot_certificate_hash(
    lot_id: int,
    collector_id: int,
    material_name: str | None,
    quantity_kg: float,
    final_weight_kg: float | None = None,
    final_price: float | None = None,
    recycler_id: int | None = None,
    signature: str | None = None,
    status: str = "created",
) -> str:
    """
    Generate immutable SHA-256 digital certificate hash representing
    the cryptographic chain of custody for a lot from creation to smelter.
    """
    hash_payload = (
        f"lot:{lot_id}|collector:{collector_id}|material:{material_name or 'unknown'}|"
        f"init_qty:{quantity_kg}|final_weight:{final_weight_kg}|price:{final_price}|"
        f"recycler:{recycler_id or 'none'}|sig:{signature or 'none'}|"
        f"status:{status}"
    )
    return hashlib.sha256(hash_payload.encode("utf-8")).hexdigest()
