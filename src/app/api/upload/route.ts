import { NextRequest, NextResponse } from 'next/server';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { createHash } from 'crypto';
import schema from '@/platform/schemas/biophoton-experiment.schema.json';
import { notarizeWithAO, uploadToArweave } from '@/platform/services';

const ajv = new Ajv();
addFormats(ajv);
const validate = ajv.compile(schema);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const metadataString = formData.get('metadata') as string | null;

    if (!file || !metadataString) {
      return NextResponse.json({ error: 'Missing file or metadata' }, { status: 400 });
    }

    // 1. Parse and Validate Metadata
    const metadata = JSON.parse(metadataString);
    const valid = validate(metadata);
    if (!valid) {
      return NextResponse.json(
        {
          error: 'Invalid metadata',
          details: validate.errors?.map(err => `${err.instancePath} ${err.message}`).join(', '),
        },
        { status: 400 }
      );
    }

    // 2. Read file and create hash
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const dataHash = createHash('sha256').update(fileBuffer).digest('hex');

    // 3. Notarize with AO (using placeholder)
    const aoReceiptId = await notarizeWithAO(dataHash);

    // 4. Upload to Arweave (using placeholder)
    const txId = await uploadToArweave(fileBuffer, metadata, aoReceiptId);

    // 5. Return result
    return NextResponse.json({ txId });

  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}