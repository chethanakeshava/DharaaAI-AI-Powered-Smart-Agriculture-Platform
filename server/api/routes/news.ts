import { RequestHandler } from 'express';

interface NewsArticle {
  source: { id: string | null; name: string };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

export const getNews: RequestHandler = async (req, res) => {
  try {
    const apiKey = process.env.NEWS_API_KEY || process.env.VITE_NEWS_API_KEY;

    if (!apiKey) {
      // Gracefully skip news if API key is not configured
      return res.json({
        articles: [],
        status: 'no_key',
      });
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?q=agriculture+farming+crops+soil&sortBy=publishedAt&language=en&pageSize=6&apiKey=${apiKey}`
    );

    if (!response.ok) {
      console.error('NewsAPI error:', response.status, response.statusText);
      return res.status(500).json({
        articles: [],
        error: 'Failed to fetch news from external API',
      });
    }

    const data: NewsApiResponse = await response.json();
    res.json({
      articles: data.articles || [],
      status: data.status,
    });
  } catch (err) {
    console.error('Error fetching news:', err);
    res.status(500).json({
      articles: [],
      error: 'Unable to load news at this moment',
    });
  }
};
