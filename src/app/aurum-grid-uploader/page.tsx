"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface AurumUpload {
  id: string;
  name: string;
  type: "symbolic" | "quantum" | "biometric" | "standard" | "activation";
  format: string;
  size: string;
  status: "uploading" | "validating" | "synchronizing" | "completed" | "failed";
  progress: number;
  uploadDate: string;
  coherence: number;
  resonance?: number;
  author: string;
  description?: string;
  timestamp: string;
  nodeId?: string;
}

interface HarmonicNode {
  id: string;
  name: string;
  status: "active" | "inactive" | "synchronizing";
  location: string;
  coherence: number;
  lastSync: string;
  dataTypes: string[];
}

interface ValidationResult {
  isValid: boolean;
  coherence: number;
  issues: string[];
  warnings: string[];
  resonance?: number;
}

export default function AurumGridUploader() {
  const [activeTab, setActiveTab] = useState("uploader");
  const [uploadItems, setUploadItems] = useState<AurumUpload[]>([]);
  const [harmonicNodes, setHarmonicNodes] = useState<HarmonicNode[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUpload, setCurrentUpload] = useState<AurumUpload | null>(null);

  const [dataType, setDataType] = useState("standard");
  const [dataFormat, setDataFormat] = useState("json");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [enableAUI, setEnableAUI] = useState(false);
  const [coherenceThreshold, setCoherenceThreshold] = useState("0.8");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize with sample data
  useEffect(() => {
    setUploadItems([
      {
        id: "1",
        name: "Quantum Entanglement Dataset",
        type: "quantum",
        format: "bin",
        size: "15.3 MB",
        status: "completed",
        progress: 100,
        uploadDate: "2024-01-20T10:30:00Z",
        coherence: 0.95,
        resonance: 0.87,
        author: "Dr. Sarah Chen",
        description: "Quantum entanglement measurements from Lab A",
        timestamp: "2024-01-20T10:30:00Z",
        nodeId: "node-quantum-01"
      },
      {
        id: "2",
        name: "Symbolic Sequence Alpha",
        type: "symbolic",
        format: "json",
        size: "2.1 MB",
        status: "synchronizing",
        progress: 75,
        uploadDate: "2024-01-19T14:22:00Z",
        coherence: 0.88,
        resonance: 0.92,
        author: "Aurum Research Team",
        description: "Primary symbolic activation sequence",
        timestamp: "2024-01-19T14:22:00Z",
        nodeId: "node-symbolic-03"
      },
      {
        id: "3",
        name: "EEG Biosync Session",
        type: "biometric",
        format: "csv",
        size: "8.7 MB",
        status: "validating",
        progress: 45,
        uploadDate: "2024-01-18T09:15:00Z",
        coherence: 0.76,
        author: "Subject Alpha-7",
        description: "Biometric synchronization session data",
        timestamp: "2024-01-18T09:15:00Z"
      }
    ]);

    setHarmonicNodes([
      {
        id: "node-quantum-01",
        name: "Quantum Processing Node",
        status: "active",
        location: "Server Room A",
        coherence: 0.96,
        lastSync: "2024-01-20T10:35:00Z",
        dataTypes: ["quantum", "standard"]
      },
      {
        id: "node-symbolic-03",
        name: "Symbolic Analysis Node",
        status: "synchronizing",
        location: "Cloud Cluster B",
        coherence: 0.91,
        lastSync: "2024-01-20T10:32:00Z",
        dataTypes: ["symbolic", "activation"]
      },
      {
        id: "node-biometric-02",
        name: "Biometric Integration Node",
        status: "active",
        location: "Medical Facility C",
        coherence: 0.84,
        lastSync: "2024-01-20T10:28:00Z",
        dataTypes: ["biometric", "standard"]
      },
      {
        id: "node-harmonic-01",
        name: "Primary Harmonic Node",
        status: "active",
        location: "Central Hub",
        coherence: 0.99,
        lastSync: "2024-01-20T10:30:00Z",
        dataTypes: ["symbolic", "quantum", "biometric", "standard", "activation"]
      }
    ]);
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !author) return;

    setIsUploading(true);
    setUploadProgress(0);

    const uploadItem: AurumUpload = {
      id: Date.now().toString(),
      name: file.name,
      type: dataType as any,
      format: dataFormat,
      size: formatFileSize(file.size),
      status: "uploading",
      progress: 0,
      uploadDate: new Date().toISOString(),
      coherence: 0,
      author,
      description: description || undefined,
      timestamp: new Date().toISOString()
    };

    setCurrentUpload(uploadItem);
    setUploadItems(prev => [uploadItem, ...prev]);

    // Simulate upload process
    const steps = [
      { progress: 10, message: "Initializing upload..." },
      { progress: 25, message: "Transferring data..." },
      { progress: 40, message: "Validating format..." },
      { progress: 60, message: "Checking coherence..." },
      { progress: 80, message: "Synchronizing with harmonic nodes..." },
      { progress: 95, message: "Finalizing integration..." },
      { progress: 100, message: "Upload completed!" }
    ];

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setUploadProgress(step.progress);
      setUploadItems(prev => prev.map(item =>
        item.id === uploadItem.id
          ? { ...item, progress: step.progress }
          : item
      ));
    }

    // Simulate validation and coherence checking
    const validationResult = await validateData(uploadItem);

    // Update status based on validation
    const finalStatus = validationResult.isValid ? "completed" : "failed";
    const coherence = validationResult.coherence;
    const resonance = validationResult.resonance;

    setUploadItems(prev => prev.map(item =>
      item.id === uploadItem.id
        ? {
            ...item,
            status: finalStatus,
            progress: 100,
            coherence,
            resonance,
            nodeId: validationResult.isValid ? "node-harmonic-01" : undefined
          }
        : item
    ));

    // Trigger AUI response if enabled and validation passed
    if (enableAUI && validationResult.isValid) {
      await triggerAUIResponse(uploadItem, validationResult);
    }

    setIsUploading(false);
    setCurrentUpload(null);
    setUploadProgress(0);

    // Reset form
    setAuthor("");
    setDescription("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateData = async (upload: AurumUpload): Promise<ValidationResult> => {
    // Simulate validation process
    await new Promise(resolve => setTimeout(resolve, 1000));

    const baseCoherence = Math.random() * 0.3 + 0.7; // 0.7 to 1.0
    const threshold = parseFloat(coherenceThreshold);
    const isValid = baseCoherence >= threshold;

    const issues = isValid ? [] : [
      "Coherence level below threshold",
      "Data format inconsistencies detected"
    ];

    const warnings = [
      "Recommend additional validation for production use",
      "Consider cross-referencing with existing datasets"
    ];

    return {
      isValid,
      coherence: baseCoherence,
      resonance: isValid ? Math.random() * 0.2 + 0.8 : undefined,
      issues,
      warnings
    };
  };

  const triggerAUIResponse = async (upload: AurumUpload, validation: ValidationResult) => {
    // Simulate AUI response
    console.log(`AUI Response triggered for upload: ${upload.name}`);
    console.log(`Coherence: ${validation.coherence}, Resonance: ${validation.resonance}`);

    // In a real implementation, this would trigger various AUI routines
    await new Promise(resolve => setTimeout(resolve, 500));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDataTypeColor = (type: string) => {
    switch (type) {
      case "symbolic": return "destructive";
      case "quantum": return "secondary";
      case "biometric": return "outline";
      case "activation": return "default";
      case "standard": return "default";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "uploading": return "outline";
      case "validating": return "secondary";
      case "synchronizing": return "secondary";
      case "failed": return "destructive";
      default: return "default";
    }
  };

  const getNodeStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "inactive": return "outline";
      case "synchronizing": return "secondary";
      default: return "default";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Aurum Grid Uploader Interface</h1>
        <p className="text-muted-foreground">
          Gateway for multidimensional data ingestion into the Aurum Grid's harmonic ledger
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="uploader">Uploader</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
          <TabsTrigger value="nodes">Harmonic Nodes</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="uploader" className="mt-6">
          <div className="space-y-6">
            {/* Current Upload Progress */}
            {isUploading && currentUpload && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">Uploading</Badge>
                    {currentUpload.name}
                  </CardTitle>
                  <CardDescription>
                    Uploading {currentUpload.type} data to Aurum Grid
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={uploadProgress} className="w-full" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Progress: {uploadProgress}%</span>
                      <span>Size: {currentUpload.size}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Upload Form */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Data to Aurum Grid</CardTitle>
                <CardDescription>
                  Submit symbolic, quantum, biometric, or standard data for synchronization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dataType">Data Type</Label>
                    <Select value={dataType} onValueChange={setDataType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="symbolic">Symbolic Sequences & Glyphic Keys</SelectItem>
                        <SelectItem value="quantum">Quantum Telemetry</SelectItem>
                        <SelectItem value="biometric">EEG Logs & Biometric Files</SelectItem>
                        <SelectItem value="activation">Z(n) Activation Files</SelectItem>
                        <SelectItem value="standard">Standard Files (CSV, JSON, PDF, etc.)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataFormat">Format</Label>
                    <Select value={dataFormat} onValueChange={setDataFormat}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="bin">BIN</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="docx">DOCX</SelectItem>
                        <SelectItem value="txt">TXT</SelectItem>
                        <SelectItem value="eeg">EEG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="author">Author/Operator</Label>
                  <Input
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Enter your name or identifier"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the data being uploaded"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="coherenceThreshold">Coherence Threshold</Label>
                    <Select value={coherenceThreshold} onValueChange={setCoherenceThreshold}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select threshold" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.6">Low (0.6)</SelectItem>
                        <SelectItem value="0.8">Medium (0.8)</SelectItem>
                        <SelectItem value="0.9">High (0.9)</SelectItem>
                        <SelectItem value="0.95">Very High (0.95)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2 pt-6">
                    <Switch
                      id="enableAUI"
                      checked={enableAUI}
                      onCheckedChange={setEnableAUI}
                    />
                    <Label htmlFor="enableAUI">Enable AUI Response</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    disabled={!author || isUploading}
                    accept={
                      dataType === "biometric" ? ".csv,.eeg" :
                      dataType === "quantum" ? ".bin,.json" :
                      dataType === "symbolic" ? ".json,.txt" :
                      dataType === "activation" ? ".json,.bin" :
                      "*/*"
                    }
                  />
                </div>

                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!author || isUploading}
                  className="w-full"
                >
                  {isUploading ? "Uploading..." : "Upload to Aurum Grid"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="uploads" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload History</CardTitle>
              <CardDescription>
                Track the status and coherence of all uploaded data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <div className="space-y-4">
                  {uploadItems.map((upload) => (
                    <Card key={upload.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{upload.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant={getDataTypeColor(upload.type)}>
                                {upload.type}
                              </Badge>
                              <Badge variant="outline">{upload.format.toUpperCase()}</Badge>
                              <Badge variant={getStatusColor(upload.status)}>
                                {upload.status}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            <div>{upload.size}</div>
                            <div>{new Date(upload.timestamp).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          {upload.description && (
                            <p className="text-sm text-muted-foreground">{upload.description}</p>
                          )}

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Author</div>
                              <div className="text-muted-foreground">{upload.author}</div>
                            </div>
                            <div>
                              <div className="font-medium">Coherence</div>
                              <div className="text-muted-foreground">
                                {(upload.coherence * 100).toFixed(1)}%
                              </div>
                            </div>
                            {upload.resonance && (
                              <div>
                                <div className="font-medium">Resonance</div>
                                <div className="text-muted-foreground">
                                  {(upload.resonance * 100).toFixed(1)}%
                                </div>
                              </div>
                            )}
                            {upload.nodeId && (
                              <div>
                                <div className="font-medium">Node</div>
                                <div className="text-muted-foreground">{upload.nodeId}</div>
                              </div>
                            )}
                          </div>

                          {upload.status !== "completed" && (
                            <Progress value={upload.progress} className="w-full" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nodes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Harmonic Nodes</CardTitle>
              <CardDescription>
                Active nodes in the Aurum Grid network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {harmonicNodes.map((node) => (
                    <Card key={node.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{node.name}</CardTitle>
                            <div className="flex items-center gap-2">
                              <Badge variant={getNodeStatusColor(node.status)}>
                                {node.status}
                              </Badge>
                              <Badge variant="outline">{node.id}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="text-sm text-muted-foreground">
                            Location: {node.location}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="font-medium">Coherence</div>
                              <div className="text-muted-foreground">
                                {(node.coherence * 100).toFixed(1)}%
                              </div>
                            </div>
                            <div>
                              <div className="font-medium">Last Sync</div>
                              <div className="text-muted-foreground">
                                {new Date(node.lastSync).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="font-medium text-sm mb-2">Supported Types</div>
                            <div className="flex flex-wrap gap-1">
                              {node.dataTypes.map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Validation & Coherence</CardTitle>
              <CardDescription>
                Data validation rules and coherence scoring system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] w-full">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Coherence Thresholds</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Low</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">0.6</div>
                          <div className="text-sm text-muted-foreground">
                            Basic validation only
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Medium</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">0.8</div>
                          <div className="text-sm text-muted-foreground">
                            Standard validation
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">High</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">0.9</div>
                          <div className="text-sm text-muted-foreground">
                            Strict validation
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Very High</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">0.95</div>
                          <div className="text-sm text-muted-foreground">
                            Maximum security
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Data Type Requirements</h3>
                    <div className="space-y-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Symbolic Sequences</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Must contain valid glyphic patterns</li>
                            <li>• Sequence length must be divisible by 7</li>
                            <li>• Requires symbolic key validation</li>
                            <li>• Minimum coherence: 0.85</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Quantum Telemetry</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Must include spacetime coordinates</li>
                            <li>• Entanglement signatures required</li>
                            <li>• Quantum state verification</li>
                            <li>• Minimum coherence: 0.90</li>
                          </ul>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Biometric Files</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            <li>• Biosync compatibility required</li>
                            <li>• Sample rate must be ≥ 256Hz</li>
                            <li>• Subject identification mandatory</li>
                            <li>• Minimum coherence: 0.75</li>
                          </ul>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-3">AUI Response Triggers</h3>
                    <Alert>
                      <AlertDescription>
                        When enabled, AUI response routines are triggered for uploads that meet the coherence threshold.
                        This includes symbolic activation, resonance scoring, and cross-node synchronization.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}