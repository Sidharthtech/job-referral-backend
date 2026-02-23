const { gql } = require("apollo-server");

module.exports = gql`
  enum Role {
    EMPLOYEE
    HR
  }

  enum ReferralStatus {
    PENDING
    HIRED
    REJECTED
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
  }

  type Candidate {
    id: ID!
    name: String!
    email: String!
    experienceYears: Int!
  }

  type Referral {
    id: ID!
    status: ReferralStatus!
    candidate: Candidate!
    referredBy: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    myReferrals: [Referral]
    allReferrals: [Referral]
  }

  type Mutation {
    register(
      name: String!
      email: String!
      password: String!
      role: Role!
    ): AuthPayload
    login(
    email: String!
    password: String!
    ): AuthPayload
    createCandidate(
    name: String!
    email: String!
    experienceYears: Int!
    ): Candidate
    createReferral(
    candidateId: ID!
    ): Referral
    updateReferralStatus(
    referralId: ID!
    status: ReferralStatus!
    ): Referral
  }
`;