# Permanent File Storage AO Process (IPFS)

This repository contains a simple yet powerful AO (Autonomous Organization) smart contract for managing metadata of files stored on the InterPlanetary File System (IPFS). It provides a decentralized and owner-controlled way to register, list, and delete references to off-chain data.

## Overview

The core idea is to separate the heavy data (the files themselves) from the lightweight metadata (references, names, sizes). The files are uploaded to IPFS, which provides a unique Content Identifier (CID). This CID is then registered with the AO process, creating an on-chain, verifiable record of ownership and existence.

This approach allows for efficient, scalable, and permanent data management on a decentralized backbone.

## Features

-   **Decentralized Metadata:** All file records are stored on the AO permaweb.
-   **Owner-Controlled:** Only the wallet that registers a file can delete it.
-   **IPFS Integration:** Leverages IPFS for content-addressed, permanent file storage.
-   **Simple API:** A minimal set of actions (`Upload`, `List`, `Delete`) makes it easy to integrate with any application.

## API Reference

You can interact with the deployed process by sending messages with specific `Action` tags.

### 1. Upload

Registers a new file by associating its IPFS CID with metadata. The sender of the message is automatically recorded as the owner.

-   **Action:** `Upload`
-   **Payload (JSON):**
    ```json
    {
      "cid": "Qm...",
      "name": "my-research-paper.pdf",
      "size": 1048576
    }
    ```
-   **Fields:**
    -   `cid` (string, required): The IPFS Content Identifier for the file.
    -   `name` (string, required): A human-readable name for the file.
    -   `size` (number, required): The file size in bytes.

### 2. List

Retrieves a list of all file records registered by the sender of the message.

-   **Action:** `List`
-   **Payload:** None required.

### 3. Delete

Removes a file record from the contract's state. This action can only be successfully executed by the original owner of the record.

-   **Action:** `Delete`
-   **Payload (JSON):**
    ```json
    {
      "cid": "Qm..."
    }
    ```
-   **Fields:**
    -   `cid` (string, required): The IPFS CID of the file record to delete.

## Deployment and Usage

You can deploy and interact with this process using `aos`, the command-line tool for AO.

### 1. Deployment

To deploy the contract, run the following command from your terminal:

```bash
aos permanent_storage.lua --wallet /path/to/your/arweave-keyfile.json
```

Upon successful deployment, `aos` will return a **Process ID**. Save this ID for the next steps.

```
Process: <YOUR_PROCESS_ID>
```

### 2. Interaction Examples

Replace `<YOUR_PROCESS_ID>` with the ID you received during deployment.

**To upload a file record:**

```bash
aos --process <YOUR_PROCESS_ID> --action Upload --data '{"cid": "QmXgZp...","name": "dataset.zip", "size": 5000000}'
```

**To list your uploaded files:**

```bash
aos --process <YOUR_PROCESS_ID> --action List
```

**To delete a file record:**

```bash
aos --process <YOUR_PROCESS_ID> --action Delete --data '{"cid": "QmXgZp..."}'
```