import re
from typing import Dict, Any, Optional

class SecurityViolationError(Exception):
    """Raised when a security violation is detected."""
    pass

def validate_user_prompt(prompt: str, tenant_context: Dict[str, Any]) -> str:
    """
    Sanitizes and validates the user prompt to prevent injection attacks and 
    ensure tenant isolation.

    Args:
        prompt: The raw user input string.
        tenant_context: The context of the current tenant.

    Returns:
        The sanitized prompt string.

    Raises:
        SecurityViolationError: If a malicious pattern is detected.
    """
    # 1. Basic Sanitization (Trim whitespace, remove null bytes)
    sanitized = prompt.strip().replace('\0', '')

    # 2. Check for Cross-Tenant Access Attempts (Simple Keyword Matching)
    # In a real system, this would be more sophisticated (e.g., using an LLM classifier)
    forbidden_patterns = [
        r"ignore previous instructions",
        r"system prompt",
        r"tenant_id",
        r"access other tenant",
        r"override security"
    ]

    for pattern in forbidden_patterns:
        if re.search(pattern, sanitized, re.IGNORECASE):
            # Log the attempt (in a real system)
            print(f"SECURITY ALERT: Potential injection attempt detected for Tenant {tenant_context.get('tenant_id')}: {pattern}")
            raise SecurityViolationError("Potential prompt injection detected.")

    return sanitized

def filter_llm_output(output: str, tenant_context: Dict[str, Any]) -> str:
    """
    Scans the LLM output for potential PII or cross-tenant data leakage.

    Args:
        output: The raw output from the LLM.
        tenant_context: The context of the current tenant.

    Returns:
        The filtered output string.
    """
    # 1. Check for PII (Simple Regex for Email/Phone)
    # Note: This is a basic example. Real PII detection requires NLP.
    email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    phone_pattern = r"\b\d{3}[-.]?\d{3}[-.]?\d{4}\b"

    # Redact Emails
    filtered = re.sub(email_pattern, "[REDACTED_EMAIL]", output)
    
    # Redact Phones
    filtered = re.sub(phone_pattern, "[REDACTED_PHONE]", filtered)

    # 2. Check for Tenant ID Leakage (preventing the LLM from revealing its own context)
    tenant_id = tenant_context.get('tenant_id')
    if tenant_id and tenant_id in filtered:
        filtered = filtered.replace(tenant_id, "[REDACTED_TENANT_ID]")

    return filtered
