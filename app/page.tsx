'use client';

import { useState } from 'react';
import { Container, Form, Button, Spinner, Alert, Card, Navbar } from 'react-bootstrap';
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
    <div className="d-flex flex-column min-vh-100 bg-light">
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand href="#home">URL Summarizer</Navbar.Brand>
        </Container>
      </Navbar>

      <Container className="flex-grow-1 d-flex flex-column justify-content-center align-items-center py-5">
        <h1 className="text-center mb-3">URL Summarizer</h1>
        <p className="text-center mb-5 text-muted lead">
          Enter a URL below to get a concise, one-sentence summary of its content.
        </p>
        <Form onSubmit={handleSubmit} className="w-100" style={{ maxWidth: '600px' }}>
          <Form.Group className="mb-3">
            <Form.Control
              type="url"
              placeholder="Enter URL to summarize (e.g., https://example.com)"
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
                  <span className="visually-hidden">Summarizing...</span>
                </>
              ) : (
                'Summarize'
              )}
            </Button>
          </div>
        </Form>

        {error && (
          <Alert variant="danger" className="mt-4 w-100" style={{ maxWidth: '600px' }}>
            {error}
          </Alert>
        )}

        {summary && (
          <Card className="mt-4 w-100" style={{ maxWidth: '600px' }}>
            <Card.Body>
              <Card.Title>Summary</Card.Title>
              <Card.Text>{summary}</Card.Text>
            </Card.Body>
          </Card>
        )}
      </Container>

      <footer className="bg-dark text-white text-center py-3 mt-auto">
        <Container>
          <p className="mb-0">&copy; {new Date().getFullYear()} URL Summarizer. All rights reserved.</p>
        </Container>
      </footer>
    </div>
  );
}