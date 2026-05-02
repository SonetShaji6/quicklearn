import { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, StorageSharedKeyCredential } from "@azure/storage-blob";

// Ensure AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME + AZURE_STORAGE_ACCOUNT_KEY are set in .env
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || "";

export function getBlobServiceClient() {
  if (!connectionString) {
    throw new Error("Missing AZURE_STORAGE_CONNECTION_STRING environment variable");
  }
  return BlobServiceClient.fromConnectionString(connectionString);
}

export async function uploadBlob(containerName: string, blobName: string, buffer: Buffer, contentType: string) {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  
  // Create container if it doesn't exist
  await containerClient.createIfNotExists();
  
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  
  return blockBlobClient.url;
}

export async function getSignedUrl(containerName: string, blobName: string, expiresInMinutes: number = 60) {
  const blobServiceClient = getBlobServiceClient();
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  const startsOn = new Date();
  const expiresOn = new Date(startsOn);
  expiresOn.setMinutes(startsOn.getMinutes() + expiresInMinutes);

  // You must authenticate with connection string (SharedKeyCredential) to generate SAS tokens locally
  const credential = blobServiceClient.credential as StorageSharedKeyCredential;
  if (!credential || !(credential instanceof StorageSharedKeyCredential)) {
      throw new Error("Cannot generate SAS token without StorageSharedKeyCredential.");
  }

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

  return `${blockBlobClient.url}?${sasToken}`;
}
