from langchain_aws import ChatBedrockConverse

from .base import CredentialField, ProviderRequestConfig, ProviderSpec


def bedrock_factory(config: ProviderRequestConfig) -> ChatBedrockConverse:
    """Create a ChatBedrockConverse model from resolved config."""
    values = config.values
    return ChatBedrockConverse(
        model=values.get("model", "anthropic.claude-3-5-sonnet-20241022-v2:0"),
        region_name=values.get("region", "us-east-1"),
        aws_access_key_id=values.get("access_key_id") or None,
        aws_secret_access_key=values.get("secret_access_key") or None,
        credentials_profile_name=values.get("profile") or None,
    )


BEDROCK_SPEC = ProviderSpec(
    key="bedrock",
    label="AWS Bedrock",
    default_model="anthropic.claude-3-5-sonnet-20241022-v2:0",
    fields=[
        CredentialField(
            name="region",
            label="AWS Region",
            type="text",
            required=False,
            placeholder="us-east-1",
        ),
        CredentialField(
            name="model",
            label="Model ID",
            type="text",
            required=False,
            placeholder="anthropic.claude-3-5-sonnet-20241022-v2:0",
        ),
        CredentialField(
            name="access_key_id",
            label="AWS Access Key ID (optional)",
            type="secret",
            required=False,
            placeholder="Uses default credential chain if empty",
        ),
        CredentialField(
            name="secret_access_key",
            label="AWS Secret Access Key (optional)",
            type="secret",
            required=False,
            placeholder="Uses default credential chain if empty",
        ),
        CredentialField(
            name="profile",
            label="AWS Profile (optional)",
            type="text",
            required=False,
            placeholder="Uses default profile if empty",
        ),
    ],
    env_var_map={
        "region": "AWS_REGION",
        "model": "BEDROCK_MODEL_ID",
        "access_key_id": "AWS_ACCESS_KEY_ID",
        "secret_access_key": "AWS_SECRET_ACCESS_KEY",
        "profile": "AWS_PROFILE",
    },
)
