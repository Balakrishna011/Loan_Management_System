const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")


const userModel = require("../models/user");
const Credit_scoreModel = require("../models/Credit_score");
const loanApplicationModel = require("../models/Loan_application");
const collateralModel = require("../models/Collateral")
const loanofficerModel = require("../models/Loan_officer")
const LoanModel = require("../models/Loan")
const LoanRepayModel = require("../models/Loan_Repayment_schedule")
const LoanPaymentHistory = require("../models/loan_payment_history");
const TransactionModel = require("../models/Transactions")
const checkAuthUser = require("../middleware/checkAuthUser");
const insuranceModel = require("../models/Insurance_Policy")
const PaymentModel = require("../models/payment")


router.post("/signup", (req, res) => {
    // Check if the email already exists
    console.log(req.body)
    userModel.findOne({ email: req.body.email })
        .then((existingUser) => {
            if (existingUser) {
                return res.status(409).json({
                    message: "Email already exists",
                });
            }

            // Hash the password
            bcrypt.hash(req.body.password, 10, function (err, hash) {
                if (err) {
                    console.log(err);
                    return res.status(500).json({
                        error: err,
                    });
                }

                // Create a new user
                const newUser = new userModel({
                    _id: new mongoose.Types.ObjectId(),
                    name: req.body.name,
                    address: req.body.address,
                    mobile_number: req.body.mobile_number,
                    password: hash,
                    email: req.body.email,
                    SSN: req.body.SSN,
                    DOB: req.body.DOB,
                    score:req.body.score_value
                });

                // Save the user
                newUser.save()
                    .then((result) => {
                        // Save user successful, now update the credit_score
                        const userId = result._id;

                        // Create a new credit_score document
                        const creditScore = new Credit_scoreModel({
                            _id: new mongoose.Types.ObjectId(),
                            score_value: req.body.score_value,
                        });

                        // Save the credit_score
                        creditScore.save()
                            .then(() => {
                                // Update the user document with the new credit_score _id
                                userModel.findByIdAndUpdate(userId, { $set: { credit_score: creditScore._id } })
                                    .then(() => {
                                        // User and credit_score updated successfully
                                        const token = jwt.sign({
                                            userType: "User",
                                            userId: userId,
                                            name: req.body.name,
                                            address: req.body.address,
                                            email: req.body.email,
                                            password: hash, 
                                            mobile_number: req.body.mobile_number,
                                            SSN: req.body.SSN,
                                            DOB: req.body.DOB,
                                        },
                                        process.env.jwtSecret, {
                                            expiresIn: "1d",
                                        });

                                        res.status(201).json({
                                            message: "User created",
                                            userDetails: {
                                                userId: userId,
                                                name: req.body.name,
                                                address: req.body.address,
                                                mobile_number: req.body.mobile_number,
                                                email: req.body.email,
                                                SSN: req.body.SSN,
                                                DOB: req.body.DOB,
                                                credit_score: creditScore._id,
                                            },
                                            token: token,
                                        });
                                    })
                                    .catch((err) => {
                                        console.log(err);
                                        res.status(500).json({
                                            error: err,
                                        });
                                    });
                            })
                            .catch((err) => {
                                console.log(err);
                                res.status(500).json({
                                    error: err,
                                });
                            });
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).json({
                            error: err,
                        });
                    });
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                error: err.toString(),
            });
        });
});



router.post("/login", (req, res) => {
    userModel.find({ email: req.body.email })
        .then((customer) => {
            if (customer.length < 1) {
                return res.status(401).json({
                    message: "Auth failed: Email not found probably",
                });
            }
            // console.log(req.body, customer)
            bcrypt.compare(req.body.password, customer[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: "Auth failed",
                    });
                }
                if (result) {
                    const token = jwt.sign({
                        userType: "User",
                        userId: customer[0]._id,
                        name: customer[0].name,
                        address: customer[0].address,
                        email: customer[0].email,
                        password: customer[0].password,
                        mobile_number: customer[0].mobile_number,
                        SSN: customer[0].SSN,
                        DOB: customer[0].DOB,
                    },
                        process.env.jwtSecret, {
                        expiresIn: "1d",
                    },
                    );

                    return res.status(200).json({
                        message: "Auth successful",
                        userDetails: {
                            userType: "User",
                            name: customer[0].name,
                            address: customer[0].address,
                            email: customer[0].email,
                            password: customer[0].password,
                            phoneNumber: customer[0].phoneNumber,
                            mobile_number: customer[0].mobile_number,
                            SSN: customer[0].SSN,
                            DOB: customer[0].DOB,
                        },
                        token: token,
                    });
                }
                res.status(401).json({
                    message: "Auth failed1",
                });

            })
        })
        .catch((err) => {
            res.status(500).json({
                error: err,
            });
        })

})

router.post('/apply',checkAuthUser, async (req, res) => {
    console.log(req.body)
    const userId = req.user.userId;
    try {
      // Create a new collateral entry
      const collateralData = {
        _id: new mongoose.Types.ObjectId(),
        collateral_type: req.body.collateral_type,
        collateral_value: req.body.collateral_value,
        collateral_description: req.body.collateral_description,
      };
  
      const newCollateral = new collateralModel(collateralData);
      newCollateral.save();
  
      // Assuming you have a Loan model with the required fields
      const loanData = {
        _id: new mongoose.Types.ObjectId(),
        purpose: req.body.purpose,
        start_date:req.body.start_date,
        amount_requested: req.body.amount_requested,
        end_date: req.body.end_date,
        user:userId,
        term:req.body.term,
        collateral:collateralData._id,
      };

      // Create a new loan application
      const newLoanApplication = await loanApplicationModel.create(loanData);
  
      // Randomly assign a loan officer from the Loan_officer table
      let randomLoanOfficer = await loanofficerModel.aggregate([{ $sample: { size: 1 } }]);


      const loanOfficerId = randomLoanOfficer[0]._id;
        await loanofficerModel.findByIdAndUpdate(loanOfficerId, {
            $push: { loan_applications: { Loan_applicationId: newLoanApplication._id } }
        });
  
      res.status(201).json({
        message: 'Loan application submitted successfully',
        loanApplication: newLoanApplication,
        collateral: newCollateral,
        loanofficer:randomLoanOfficer[0]
      });
    } catch (error) {
      console.error('Error applying for a loan:', error);
      res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  });

  router.get("/applications",checkAuthUser, async (req, res) => {
    try {
        // Assuming you have some way to identify the user, for example, through a token
        const userId = req.user.userId;

        // Find the user and populate the loan applications
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        const userLoanApplications = await loanApplicationModel.find({ user: userId })
        .populate({
          path: 'loan_review',
          model: 'Loan_review',
      });

        // Extract loan application IDs from the user's loan applications
        const loanApplicationIds = userLoanApplications.map(loanApp => loanApp._id);

        // Find the loan officers associated with the user's loan applications
        const loanOfficers = await loanofficerModel.find({ "loan_applications.Loan_applicationId": { $in: loanApplicationIds } });

        const loanApplicationsWithOfficers = userLoanApplications.map(loanApp => {
            // Find the loan officer associated with this loan application
            const associatedLoanOfficer = loanOfficers.find(officer => officer.loan_applications.some(app => app.Loan_applicationId.equals(loanApp._id)));

            return {
                loanApplication: loanApp,
                loanOfficer: associatedLoanOfficer,
            };
        });
        res.status(200).json({
            message: "Loan applications retrieved successfully",
            loanApplications: loanApplicationsWithOfficers,
        });
    } catch (error) {
        console.error('Error fetching loan applications:', error);
        res.status(500).json({
            error: 'Internal Server Error',
        });
    }
});
router.get('/loan/:loanId',checkAuthUser, async (req, res) => {
    try {
      const loanId = req.params.loanId;
  
      // Find the loan by ID
      const loan = await LoanModel.findById(loanId).populate({
        "path":"loan_repayment_schedule",
        "model":"Loan_Repayment_Schedule"
      });
  
      if (!loan) {
        return res.status(404).json({ message: 'Loan not found' });
      }
  
      res.status(200).json({ loan });
    } catch (error) {
      console.error('Error retrieving loan:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post('/payment', checkAuthUser,async (req, res) => {
    const userId =req.user.userId
    try {
      const { repaymentPlanId, amount,transaction_type,transaction_details,installment_number} = req.body;
  
      // Find the repayment schedule plan by ID
      const repaymentPlan = await LoanRepayModel.findById(repaymentPlanId);
  
      if (!repaymentPlan) {
        return res.status(404).json({ message: 'Repayment schedule plan not found' });
      }
  
      const history ={
        _id: new mongoose.Types.ObjectId(),
        loan_ID:repaymentPlan.loan,
        paid_amount:amount,
        installment_number:installment_number
      }

      const payment =new PaymentModel({
        _id: new mongoose.Types.ObjectId(),
        amount:amount
      })
      payment.save();
      const loan = await LoanModel.findByIdAndUpdate(repaymentPlan.loan,{ $push: { loan_payment_history: history._id },$inc: { amount_remained: -amount }});

      const loan_history = new LoanPaymentHistory(history)
      await loan_history.save()
      const transaction ={
        _id:new mongoose.Types.ObjectId(),
        transaction_type:transaction_type,
        transaction_amount: amount,
        transaction_details:transaction_details,
        installment_number:installment_number
      }
      const tr = new TransactionModel(transaction);
      await tr.save()

      await userModel.findByIdAndUpdate(userId, {$push: { transactions:  transaction._id } });

  
      // Update the repayment schedule plan
      await LoanRepayModel.findByIdAndUpdate(repaymentPlanId, { $set: { amount_due: 0 } });
  
      // Deduct the amount from the loan's remaining amount
      loan.amount_remained -= amount;
  
      // Save the updated loan
      await loan.save();
  
      res.status(200).json({ message: 'Transaction payment processed successfully' });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  router.get('/payments/:loanId', async (req, res) => {
    try {
      const loanId = req.params.loanId;
  
      // Find all payment details for the given loan ID
      const payments = await LoanModel.find({_id:loanId}).populate({
        "path":"loan_payment_history",
        "model":"Loan_Payment_History"
      });;
  
      res.status(200).json({ payments});
    } catch (error) {
      console.error('Error retrieving payment details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  router.get('/transactions',checkAuthUser, async (req, res) => {
    try {
      const userId = req.user.userId;
  
      // Find all payment details for the given loan ID
      const transactions = await userModel.find({_id:userId}).populate({
        "path":"transactions",
        "model":"Transactions"
      });;
  
      res.status(200).json({ transactions});
    } catch (error) {
      console.error('Error retrieving payment details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post('/insurancepolicy',checkAuthUser, async (req, res) => {

    const userId = req.user.userId;
    try {
      // Assuming you have user details in the request body
      const {policyNumber, coverageType, premiumAmount, startDate, endDate } = req.body;
  
      // Create a new insurance policy
      const newInsurancePolicy = new insuranceModel({
        _id: new mongoose.Types.ObjectId(),
        policy_number:policyNumber,
        coverage_type:coverageType,
        premium_amount:premiumAmount,
        start_date:startDate,
        end_date:endDate,
      });
  
      // Save the insurance policy to the database
      const savedInsurancePolicy = await newInsurancePolicy.save();
  
      // Associate the insurance policy with the user
      const user = await userModel.findByIdAndUpdate(
        userId,
        { $push: { insurance_policies: savedInsurancePolicy._id } },
        { new: true }
      );
  
      res.status(201).json({
        message: 'Insurance policy details saved',
        insurancePolicy: savedInsurancePolicy,
      });
    } catch (error) {
      console.error('Error saving insurance policy details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/insurancepolicy',checkAuthUser, async (req, res) => {

    const userId = req.user.userId;
    try {
      const policy = await userModel.findById(userId).populate('insurance_policies');
  
      res.status(201).json({
        insurancePolicy: policy
      });
    } catch (error) {
      console.error('Error saving insurance policy details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post('/update', checkAuthUser,async (req, res) => {
    const userId = req.user.userId;
  
    try {
      // Check if the user with the given ID exists
      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update user details based on the request body
      existingUser.name = req.body.name || existingUser.name;
      existingUser.address = req.body.address || existingUser.address;
      existingUser.mobile_number = req.body.mobile_number || existingUser.mobile_number;
      existingUser.email = req.body.email || existingUser.email;
      existingUser.SSN = req.body.SSN || existingUser.SSN;
      existingUser.DOB = req.body.DOB || existingUser.DOB;

      if(req.body.password && req.body.password !=""){
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        existingUser.password = hashedPassword || existingUser.password;
      }

      // Save the updated user details
      const updatedUser = await existingUser.save();
  
      res.status(200).json({
        message: 'User details updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Error updating user details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/', checkAuthUser,async (req, res) => {
    const userId = req.user.userId;
  
    try {
      // Check if the user with the given ID exists
      const existingUser = await userModel.findById(userId);
      if (!existingUser) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
        user: existingUser,
      });
    } catch (error) {
      console.error('Error updating user details:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

module.exports = router;