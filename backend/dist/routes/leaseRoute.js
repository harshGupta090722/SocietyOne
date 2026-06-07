import express from "express";
import { createLease, getLeaseDetails } from "../controllers/leaseController.js";
const leaseRouter = express.Router();
leaseRouter.post("/create-lease", createLease);
leaseRouter.get("/details/:flatId", getLeaseDetails);
export default leaseRouter;
