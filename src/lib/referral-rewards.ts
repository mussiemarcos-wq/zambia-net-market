import { PrismaClient } from "@prisma/client";

const REWARD_MILESTONES = [
  {
    count: 3,
    title: "Free Listing Boost Earned!",
    body: "You earned a free 7-day listing boost by referring 3 friends! Go to your dashboard to use it.",
  },
  {
    count: 5,
    title: "Free Verified Badge!",
    body: "You've been verified for free by referring 5 friends! Your profile now shows a verified badge.",
  },
  {
    count: 10,
    title: "Free Basic Subscription!",
    body: "You unlocked a free 1-month Basic subscription by referring 10 friends! Enjoy premium features.",
  },
  {
    count: 25,
    title: "Community Champion!",
    body: "You're a Community Champion! Thank you for referring 25 friends to Zambia.net Marketplace.",
  },
];

export async function checkAndGrantRewards(
  userId: string,
  referralCount: number,
  prisma: PrismaClient
) {
  const milestone = REWARD_MILESTONES.find((m) => m.count === referralCount);
  if (!milestone) return;

  // Check if this reward notification was already sent
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type: "REFERRAL_REWARD",
      data: {
        path: ["milestone"],
        equals: milestone.count,
      },
    },
  });

  if (existing) return;

  await prisma.notification.create({
    data: {
      userId,
      type: "REFERRAL_REWARD",
      title: milestone.title,
      body: milestone.body,
      data: { milestone: milestone.count },
    },
  });
}
