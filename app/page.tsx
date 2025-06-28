
'use client';

import { useState } from 'react';
import { Container, Form, Button, Spinner, Alert, Card } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function HomePage() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSummary('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get summary');
      }

      const data = await response.json();
      setSummary(data.summary);
    } catch (e: any) {
      setError(e.message);
    }

    setIsLoading(false);
  };

  return (
    <Container className="mt-5">
      <h1 className="text-center mb-4">URL Summarizer</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Control
            type="url"
            placeholder="Enter URL to summarize"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </Form.Group>
        <div className="d-grid">
          <Button variant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="visually-hidden">Loading...</span>
              </>
            ) : (
              'Summarize'
            )}
          </Button>
        </div>
      </Form>

      {error && (
        <Alert variant="danger" className="mt-4">
          {error}
        </Alert>
      )}

      {summary && (
        <Card className="mt-4">
          <Card.Body>
            <Card.Title>Summary</Card.Title>
            <Card.Text>{summary}</Card.Text>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}
