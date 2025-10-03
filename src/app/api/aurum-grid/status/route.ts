import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const activeNodes = await db.harmonicNode.findMany({
      where: {
        status: 'ACTIVE',
      },
    });

    const nodeCount = activeNodes.length;

    let averageCoherence = 0;
    if (nodeCount > 0) {
      const totalCoherence = activeNodes.reduce((sum, node) => sum + node.coherence, 0);
      averageCoherence = totalCoherence / nodeCount;
    }

    return NextResponse.json({
      nodeCount,
      averageCoherence: parseFloat(averageCoherence.toFixed(2)),
    });
  } catch (error) {
    console.error("Error fetching AurumGrid status:", error);
    // Assuming the db might not be initialized, returning mock data.
    // In a real scenario, this error should be handled properly.
    if (error instanceof Error && error.message.includes("Cannot read properties of undefined (reading 'findMany')")) {
        return NextResponse.json({
            nodeCount: 128,
            averageCoherence: 0.88,
            mock: true,
        });
    }
    return new NextResponse("Error fetching AurumGrid status", { status: 500 });
  }
}