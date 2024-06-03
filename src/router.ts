import { Router } from "express";
import db from "../drizzle/db";
import { favContact, favHadith, hadith } from "../drizzle/schema";
import axios from "axios";
import { and, eq } from "drizzle-orm";

const router = Router();

const BASE_URL = "https://developer.bdapps.com";
const APP_ID = "APP_118837";
const APP_HASH = "bla";
const APP_PASS = "7d45ec27acfcd97a26a67c093a87086b";
const NUM_EXT = "tel:88";
const META_DATA = {
  client: "MOBILEAPP",
  device: "Samsung S10",
  os: "android 8",
  appCode: "https://play.google.com/store/apps/details?id=lk",
};

// Check if a user is subscribed or not
router.post("/check-subscription", async (req, res) => {
  try {
    const { number } = req.body;

    // Check if all required fields are present
    if (!number) {
      throw new Error("Missing required fields in the request body");
    }

    console.log(NUM_EXT + number);

    // Make a POST request to check subscription status
    const response = await axios.post(BASE_URL + "/subscription/getStatus", {
      applicationId: APP_ID,
      password: APP_PASS,
      subscriberId: NUM_EXT + number,
    });

    // Check if the request was successful
    if (response.status === 200) {
      // Send response with subscription status
      res.status(200).json({
        version: response.data.version,
        statusCode: response.data.statusCode,
        statusDetail: response.data.statusDetail,
        subscriptionStatus: response.data.subscriptionStatus,
      });
    } else {
      throw new Error("Failed to check subscription status");
    }
  } catch (error: any) {
    res.status(400).send(error.message);
  }
});

//Subscribe a User
router.post("/subscribe", async (req, res) => {
  try {
    const { number } = req.body;

    // Make a POST request to bdapps.com/sub
    const response = await axios.post(BASE_URL + "/subscription/otp/request/", {
      applicationId: APP_ID,
      password: APP_PASS,
      subscriberId: NUM_EXT + number,
      applicationHash: APP_HASH,
      applicationMetaData: META_DATA,
    });

    console.log(response);

    // Check if the request was successful
    if (response.status === 200) {
      // Extract referenceNo from the response
      const { referenceNo } = response.data;

      // Send response with referenceNo
      res.status(200).json({
        statusCode: response.data.statusCode,
        referenceNo,
        statusDetail: response.data.statusDetail,
      });
    } else {
      throw new Error("Failed to send data to bdapps.com/sub");
    }
  } catch (error: any) {
    res.status(400).send(error.message);
  }
});

//  Verify Subscription
router.post("/confirm_subscription", async (req, res) => {
  try {
    const { referenceNo, otp } = req.body;
     

    // Check if all required fields are present and non-empty strings
    if (!referenceNo || !otp) {
      throw new Error("Invalid request body");
    }

    //Make a POST request to verify OTP
    const response = await axios.post(BASE_URL + "/subscription/otp/verify", {
      applicationId: APP_ID,
      password: APP_PASS,
      referenceNo,
      otp,
    });
 
    // Check if the request was successful
    if(response.data.statusCode=='S1000') return res.status(200).send("OTP verified successfully");
    else return res.status(400).send(response.data.statusDetail)

  } catch (error: any) {
    return res.status(400).send(error.message);
  }
   
});

//BroadCast SMS
router.post("/send-sms", async (req, res) => {

   const {messageBody, numbers} = req.body
   let prefNumbers = numbers.map((number: string) => "tel:88" + number);

  const payload = {
    applicationId: APP_ID,
    password: APP_PASS,
    message: messageBody,
    destinationAddresses: prefNumbers,
  };

  console.log(prefNumbers)

  try {
    const response = await axios.post(BASE_URL + "/sms/send", payload);
    console.log(response)
    if(response.data.statusCode=="S1000") return res.status(200).send("SUCCESS")
      else return res.status(500).send({ error: "Failed to send SMS" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).send({ error: "Failed to send SMS" });
  }
});

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

router.get("/hadith/fav", async (req, res) => {
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
        hadithId: +hadithId,
        mobile,
      })
      .returning();
    return res.status(201).json(fav);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.get("/favContacts/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    const fav = await db.query.favContact.findMany({
      where: (model, { eq }) => eq(model.user_mobile, mobile),
    });
    return res.status(201).json(fav);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.post("/favContact/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    const { favMobile, name } = req.body;
    const fav = await db
      .insert(favContact)
      .values({
        user_mobile: mobile,
        fav_mobile:favMobile,
        name,
      })
      .returning();
      const contact = {
        userNumber: mobile,
        name: name,
        number: favMobile
      }
    return res.status(201).json(contact);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.put("/favContact/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    const { favMobile, editedFavMobile, editedName } = req.body;
    const fav = await db
      .update(favContact)
      .set({
        fav_mobile: editedFavMobile,
        name:editedName,
      })
      .where(
        and(
          eq(favContact.user_mobile, mobile),
          eq(favContact.fav_mobile, favMobile)
        )
      )
      .returning();
    return res.status(201).json(fav);
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

router.delete("/favContact/:mobile", async (req, res) => {
  try {
    const { mobile } = req.params;
    const { favMobile } = req.body;
    const fav = await db
      .delete(favContact)
      .where(
        and(
          eq(favContact.user_mobile, mobile),
          eq(favContact.fav_mobile, favMobile)
        )
      )
      .returning();
    return res.status(201).json({message:"Deleted Contact"});
  } catch (e) {
    console.log(e);
    return res.status(400).json({ message: "Bad Request" });
  }
});

export default router;
