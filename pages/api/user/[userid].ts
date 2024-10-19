import { NextApiRequest, NextApiResponse } from "next";
import { runCorsMiddleware } from "../../../lib/cors-middleware";
import { HTTP_METHOD_NOT_ALLOWED, HTTP_OK } from "../../../lib/http-status";
import { JSDOM } from "jsdom";

interface RatingData {
  code: string;
  getyear: string;
  getmonth: string;
  getday: string;
  reason: string | null;
  penalised_in: string | null;
  rating: string;
  rank: string;
  name: string;
  end_date: Date;
  color: string;
}

// Define the structure of the response body
interface ResponseBody {
  success: boolean;
  profile: string;
  name: string | null;
  currentRating: number;
  highestRating: number;
  countryFlag: string;
  countryName: string;
  globalRank: number;
  countryRank: number;
  stars: string;
  heatMap: [];
  ratingData: RatingData[];
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  await runCorsMiddleware(req, res);

  if (req.method === "GET") {
    try {
      const response = await fetch(`https://www.codechef.com/users/aspireve`);
      const data = await response.text();

      // Extract heatmap data
      const heatMapDataCursor1 =
        data.indexOf("var userDailySubmissionsStats =") +
        "var userDailySubmissionsStats =".length;
      const heatMapDataCursor2 = data.indexOf("'#js-heatmap") - 9;
      const heatMapString = data.substring(
        heatMapDataCursor1,
        heatMapDataCursor2
      );
      const heatMapData = JSON.parse(heatMapString);

      // Extract rating data
      const ratingDataStart =
        data.indexOf("var all_rating = ") + "var all_rating = ".length;
      const ratingDataEnd = data.indexOf("var current_user_rating =") - 6;
      const ratingData = JSON.parse(
        data.substring(ratingDataStart, ratingDataEnd)
      );

      const dom = new JSDOM(data);
      const document = dom.window.document;

      // Safely extract DOM elements and handle null cases
      const profile =
        document.querySelector<HTMLImageElement>(".user-details-container img")
          ?.src || "";
      const name =
        document.querySelector<HTMLSpanElement>(".user-details-container span")
          ?.textContent || null;
      const currentRating = parseInt(
        document.querySelector<HTMLDivElement>(".rating-number")?.textContent ||
          "0",
        10
      );
      const highestRating = parseInt(
        document
          .querySelector(".rating-number")
          ?.parentElement?.children[4]?.textContent?.split("Rating")[1] || "0",
        10
      );
      const countryFlag =
        document.querySelector<HTMLImageElement>(".user-country-flag")?.src ||
        "";
      const countryName =
        document.querySelector<HTMLSpanElement>(".user-country-name")
          ?.textContent || "";
      const globalRank = parseInt(
        document.querySelector(".rating-ranks")?.children[0]?.children[0]
          ?.children[0]?.children[0]?.innerHTML || "0",
        10
      );
      const countryRank = parseInt(
        document.querySelector(".rating-ranks")?.children[0]?.children[1]
          ?.children[0]?.children[0]?.innerHTML || "0",
        10
      );
      const stars =
        document.querySelector<HTMLDivElement>(".rating")?.textContent ||
        "unrated";

      const responseBody: ResponseBody = {
        success: true,
        profile,
        name,
        currentRating,
        highestRating,
        countryFlag,
        countryName,
        globalRank,
        countryRank,
        stars,
        heatMap: heatMapData,
        ratingData,
      };

      return res.status(HTTP_OK).json(responseBody);
    } catch (error) {
      console.error("Error fetching data from CodeChef:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    return res
      .status(HTTP_METHOD_NOT_ALLOWED)
      .json({ message: "Method not allowed", error: "Invalid request method" });
  }
}
