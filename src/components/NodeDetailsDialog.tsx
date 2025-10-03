"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface HarmonicNode {
  id: string;
  name: string;
  status: string;
  location: string;
  coherence: number;
  lastSync: string;
}

export function NodeDetailsDialog() {
  const [nodes, setNodes] = useState<HarmonicNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchNodes = async () => {
        setLoading(true);
        try {
          const response = await fetch("/api/aurum-grid/nodes?status=ACTIVE");
          if (!response.ok) {
            throw new Error("Failed to fetch nodes");
          }
          const data = await response.json();
          setNodes(data.nodes);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchNodes();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">View Node Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Harmonic Node Details</DialogTitle>
        </DialogHeader>
        <div>
          {loading ? (
            <p>Loading nodes...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Coherence</TableHead>
                  <TableHead>Last Sync</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nodes.map((node) => (
                  <TableRow key={node.id}>
                    <TableCell>{node.name}</TableCell>
                    <TableCell>{node.location}</TableCell>
                    <TableCell>
                      <Badge variant={node.status === 'active' ? 'default' : 'destructive'}>
                        {node.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{node.coherence.toFixed(2)}</TableCell>
                    <TableCell>{new Date(node.lastSync).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}