import { NextResponse } from "next/server";
import { ethers } from "ethers";

export async function GET() {
  try {
    // Using a public provider, but in a real application, you'd use a dedicated one like Infura or Alchemy.
    const provider = new ethers.JsonRpcProvider("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID");

    const [blockNumber, feeData] = await Promise.all([
      provider.getBlockNumber(),
      provider.getFeeData(),
    ]);

    const gasPrice = feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "N/A";

    return NextResponse.json({
      blockNumber: blockNumber.toString(),
      gasPrice: parseFloat(gasPrice).toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching Ethereum stats:", error);
    return new NextResponse("Error fetching Ethereum stats", { status: 500 });
  }
}