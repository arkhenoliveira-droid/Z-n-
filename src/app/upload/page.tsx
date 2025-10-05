"use client";

import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [experimentId, setExperimentId] = useState('');
  const [sensorType, setSensorType] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [calibrationData, setCalibrationData] = useState('');
  const [tags, setTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    setIsSubmitting(true);

    const metadata = {
      experimentId,
      sensorType,
      timestamp: new Date(timestamp).toISOString(),
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      },
      calibrationData: calibrationData.split('\n').reduce((acc, line) => {
        const [key, value] = line.split('=');
        if (key && value) {
          acc[key.trim()] = value.trim();
        }
        return acc;
      }, {} as Record<string, string>),
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
    };

    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(`Upload successful! Arweave TX: ${data.txId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Upload Biophoton Experiment</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Raw Data File:</label>
          <input type="file" onChange={handleFileChange} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Experiment ID:</label>
          <input type="text" value={experimentId} onChange={(e) => setExperimentId(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Sensor Type:</label>
          <input type="text" value={sensorType} onChange={(e) => setSensorType(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Timestamp:</label>
          <input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <div style={{ flex: 1 }}>
            <label>Latitude:</label>
            <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Longitude:</label>
            <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Calibration Data (key=value per line):</label>
          <textarea value={calibrationData} onChange={(e) => setCalibrationData(e.target.value)} rows={4} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Tags (comma-separated):</label>
          <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          {isSubmitting ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {result && <p style={{ color: 'green', marginTop: '15px' }}>{result}</p>}
      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
    </div>
  );
}