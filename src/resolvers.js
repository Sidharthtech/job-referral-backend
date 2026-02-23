const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) return null;

      return context.prisma.user.findUnique({
        where: { id: context.user.id },
      });
    },

    myReferrals: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      return context.prisma.referral.findMany({
        where: {
          referredById: context.user.id,
        },
        include: {
          candidate: true,
          referredBy: true,
        },
      });
    },

    allReferrals: async (_, __, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      if (context.user.role !== "HR") {
        throw new Error("Only HR can view all referrals");
      }

      return context.prisma.referral.findMany({
        include: {
          candidate: true,
          referredBy: true,
        },
      });
    },
  },

  Mutation: {
    register: async (_, args, context) => {
      const { name, email, password, role } = args;

      const existingUser = await context.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("User already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await context.prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
        },
      });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return { token, user };
    },

    login: async (_, args, context) => {
      const { email, password } = args;

      const user = await context.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return { token, user };
    },

    createCandidate: async (_, args, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      return context.prisma.candidate.create({
        data: {
          name: args.name,
          email: args.email,
          experienceYears: args.experienceYears,
        },
      });
    },

    createReferral: async (_, args, context) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      if (context.user.role !== "EMPLOYEE") {
        throw new Error("Only employees can create referrals");
      }

      return context.prisma.referral.create({
        data: {
          candidateId: args.candidateId,
          referredById: context.user.id,
        },
        include: {
          candidate: true,
          referredBy: true,
        },
      });
    },
    updateReferralStatus: async (_, args, context) => {
        if (!context.user) {
            throw new Error("Not authenticated");
        }

        if (context.user.role !== "HR") {
            throw new Error("Only HR can update referral status");
        }

        return context.prisma.referral.update({
            where: { id: args.referralId },
            data: { status: args.status },
            include: {
            candidate: true,
            referredBy: true,
            },
        });
    },
  },
};