import { Router } from 'express';
import { db, schema, dbType } from '../db/index.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();
const { news } = schema;

// CREATE
router.post('/', async (req, res) => {
  try {
    const { title, slug, content, summary, imageUrl, status } = req.body;

    const newArticle = {
      id: crypto.randomUUID(), // Generate UUID string for cross-db compatibility
      title,
      slug,
      content,
      summary,
      imageUrl,
      status: status || 'DRAFT',
    };

    if (dbType === 'pg') {
      // PostgreSQL allows chainable .returning()
      const [inserted] = await db.insert(news).values(newArticle).returning();
      return res.status(201).json(inserted);
    } else {
      // MySQL standard insert
      await db.insert(news).values(newArticle);
      return res.status(201).json(newArticle);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create news article' });
  }
});


// READ ALL
router.get('/', async (req, res) => {
  try {
    const articles = await db.select().from(news);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// READ ONE BY SLUG
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Select where news.slug === req.params.slug
    const [article] = await db.select().from(news).where(eq(news.slug, slug));

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});


// READ ALL
router.get('/', async (req, res) => {
  try {
    const articles = await db.select().from(news);
    res.json(articles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// READ ONE BY SLUG
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Select where news.slug === req.params.slug
    const [article] = await db.select().from(news).where(eq(news.slug, slug));

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(article);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});



// UPDATE
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, status } = req.body;

    const updateData = {
      title,
      content,
      summary,
      status,
      updatedAt: new Date(),
    };

    if (dbType === 'pg') {
      const [updated] = await db
        .update(news)
        .set(updateData)
        .where(eq(news.id, id))
        .returning();

      if (!updated) return res.status(404).json({ error: 'Article not found' });
      return res.json(updated);
    } else {
      await db.update(news).set(updateData).where(eq(news.id, id));
      return res.json({ message: 'Article updated successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});



// DELETE
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db.delete(news).where(eq(news.id, id));

    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

export default router;