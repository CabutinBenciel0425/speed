import Merchant from "../models/merchant.model.js";

export const updateMerchantOpenStatus = async () => {
  await Merchant.updateMany(
    { status: "Open" },
    [
      // Step 1: Get current time
      { $addFields: { now: "$$NOW" } },

      // Step 2: Extract day of week — in Asia/Manila, to stay consistent with the
      // Manila-based time-of-day check in Step 6. Without an explicit timezone here,
      // this defaults to UTC and can pick the wrong calendar day near the day boundary.
      {
        $addFields: {
          dayNumber: { $dayOfWeek: { date: "$now", timezone: "Asia/Manila" } },
        },
      },

      // Step 3: Map day number to string
      {
        $addFields: {
          dayName: {
            $switch: {
              branches: [
                { case: { $eq: ["$dayNumber", 1] }, then: "Sunday" },
                { case: { $eq: ["$dayNumber", 2] }, then: "Monday" },
                { case: { $eq: ["$dayNumber", 3] }, then: "Tuesday" },
                { case: { $eq: ["$dayNumber", 4] }, then: "Wednesday" },
                { case: { $eq: ["$dayNumber", 5] }, then: "Thursday" },
                { case: { $eq: ["$dayNumber", 6] }, then: "Friday" },
                { case: { $eq: ["$dayNumber", 7] }, then: "Saturday" },
              ],
              default: "Unknown",
            },
          },
        },
      },

      // Step 4: Extract today's operating hours
      {
        $addFields: {
          todayHours: {
            $getField: {
              field: "$dayName",
              input: "$operatingHours",
            },
          },
        },
      },

      // Step 5: Compute open and close minutes
      {
        $addFields: {
          openMinutes: {
            $add: [
              { $multiply: ["$todayHours.openHour", 60] },
              "$todayHours.openMinute",
            ],
          },
          closeMinutes: {
            $add: [
              { $multiply: ["$todayHours.closeHour", 60] },
              "$todayHours.closeMinute",
            ],
          },
        },
      },

      // Step 6: Compute current minutes (Asia/Manila local time)
      {
        $addFields: {
          currentMinutes: {
            $add: [
              {
                $multiply: [
                  {
                    $toInt: {
                      $dateToString: {
                        date: "$$NOW",
                        timezone: "Asia/Manila",
                        format: "%H",
                      },
                    },
                  },
                  60,
                ],
              },
              {
                $toInt: {
                  $dateToString: {
                    date: "$$NOW",
                    timezone: "Asia/Manila",
                    format: "%M",
                  },
                },
              },
            ],
          },
        },
      },

      // Step 7: Compute isOpen
      {
        $addFields: {
          isOpenComputed: {
            $cond: {
              if: {
                $and: [
                  { $eq: ["$todayHours.isOpen", true] },
                  { $eq: ["$status", "Open"] },
                  {
                    $cond: {
                      if: { $lt: ["$closeMinutes", "$openMinutes"] },
                      then: {
                        $or: [
                          { $gte: ["$currentMinutes", "$openMinutes"] },
                          { $lt: ["$currentMinutes", "$closeMinutes"] },
                        ],
                      },
                      else: {
                        $and: [
                          { $gte: ["$currentMinutes", "$openMinutes"] },
                          { $lt: ["$currentMinutes", "$closeMinutes"] },
                        ],
                      },
                    },
                  },
                ],
              },
              then: true,
              else: false,
            },
          },
        },
      },

      // Step 8: Write the computed value to the document
      {
        $set: {
          isOpen: "$isOpenComputed",
        },
      },

      // Step 9: Strip every helper field. Update-with-pipeline persists whatever
      // exists at the end of the pipeline — without this, every field above gets
      // saved permanently onto every merchant document on every run.
      {
        $unset: [
          "now",
          "dayNumber",
          "dayName",
          "todayHours",
          "openMinutes",
          "closeMinutes",
          "currentMinutes",
          "isOpenComputed",
        ],
      },
    ],
    { updatePipeline: true },
  );

  // 2️⃣ Update merchants with status != "Open" – set isOpen = false
  await Merchant.updateMany(
    { status: { $ne: "Open" } },
    { $set: { isOpen: false } },
  );
};
