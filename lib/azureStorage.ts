import { generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential, BlockBlobClient } from "@azure/storage-blob";
import { getEnvSync } from "./env";

export function getAzureCredentials() {
  const connectionString = getEnvSync("AZURE_STORAGE_CONNECTION_STRING");
  if (!connectionString) {
    throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING environment variable");
  }
  
  const parts = connectionString.split(";").reduce((acc, part) => {
    const splitIndex = part.indexOf("=");
    if (splitIndex > 0) {
      const key = part.substring(0, splitIndex);
      const value = part.substring(splitIndex + 1);
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);

  const accountName = parts["AccountName"];
  const accountKey = parts["AccountKey"];
  const endpointSuffix = parts["EndpointSuffix"] || "core.windows.net";

  if (!accountName || !accountKey) {
    throw new Error("Invalid AZURE_STORAGE_CONNECTION_STRING format");
  }

  return { accountName, accountKey, endpointSuffix };
}

export async function uploadBlob(containerName: string, blobName: string, data: ArrayBuffer, contentType: string) {
  const { accountName, accountKey, endpointSuffix } = getAzureCredentials();
  const credential = new StorageSharedKeyCredential(accountName, accountKey);
  
  const startsOn = new Date();
  startsOn.setMinutes(startsOn.getMinutes() - 5);
  const expiresOn = new Date(startsOn.getTime());
  expiresOn.setMinutes(expiresOn.getMinutes() + 20);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("cw"),
      startsOn,
      expiresOn,
    },
    credential
  ).toString();

  const uploadUrl = `https://${accountName}.blob.${endpointSuffix}/${containerName}/${blobName}?${sasToken}`;
  
  const blockBlobClient = new BlockBlobClient(uploadUrl);
  await blockBlobClient.uploadData(data, {
    blobHTTPHeaders: { blobContentType: contentType }
  });
  
  return `https://${accountName}.blob.${endpointSuffix}/${containerName}/${blobName}`;
}

export async function getSignedUrl(containerName: string, blobName: string, expiresInMinutes: number = 60) {
  const { accountName, accountKey, endpointSuffix } = getAzureCredentials();
  const credential = new StorageSharedKeyCredential(accountName, accountKey);

  const startsOn = new Date();
  startsOn.setMinutes(startsOn.getMinutes() - 5);
  const expiresOn = new Date(startsOn.getTime());
  expiresOn.setMinutes(expiresOn.getMinutes() + expiresInMinutes + 5);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn,
      expiresOn,
    },
    credential
  ).toString();

  return `https://${accountName}.blob.${endpointSuffix}/${containerName}/${blobName}?${sasToken}`;
}
