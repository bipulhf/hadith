import { Router } from "express";
import db from "../drizzle/db";
import { favHadith, hadith } from "../drizzle/schema";

const router = Router();

router.post("/hadith", async (req, res) => {
  const { title, description, rabi, book, level } = req.body;
  try {
    const data = await db
      .insert(hadith)
      .values({
        title,
        description,
        rabi,
        book,
        level,
      })
      .returning();
    return res.status(201).json(data);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.get("/hadith", async (req, res) => {
  try {
    const data = await db.query.hadith.findMany();
    return res.status(200).json(data);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.get("/hadith/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await db.query.hadith.findMany({
      where: (model, { eq }) => eq(model.id, +id),
    });
    return res.status(200).json(data);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.get("/hadith/fav/:mobile", async (req, res) => {
  try {
    const { mobile } = req.body;
    const fav = await db.query.favHadith.findMany({
      where: (model, { eq }) => eq(model.mobile, mobile),
      with: {
        hadith: true,
      },
    });
    return res.status(201).json(fav);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.post("/hadith/fav", async (req, res) => {
  try {
    const { mobile, hadithId } = req.body;
    const fav = await db
      .insert(favHadith)
      .values({
        hadithId,
        mobile,
      })
      .returning();
    return res.status(201).json(fav);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

export default router;
