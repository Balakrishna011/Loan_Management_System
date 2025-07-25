const express = require("express");
const router = express.Router();

const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

const loanofficerModel = require("../models/Loan_officer");
const branchModel = require("../models/Branch")

const userModel = require("../models/user");
const Credit_scoreModel = require("../models/Credit_score");
const loanApplicationModel = require("../models/Loan_application");
const collateralModel = require("../models/Collateral")
const LoanModel = require("../models/Loan")
const LoanRepaymentScheduleModel = require("../models/Loan_Repayment_schedule");
const CheckAuthAdmin = require("../middleware/CheckAuthAdmin");
const ReviewModel = require("../models/Loan_review")

router.post("/signup", (req, res) => {
  // Check if the email already exists
  console.log(req.body)
  loanofficerModel.findOne({ email: req.body.email })
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
        const newUser = new loanofficerModel({
          _id: new mongoose.Types.ObjectId(),
          officer_name: req.body.name,
          officer_email: req.body.email,
          officer_mobile_number: req.body.mobile_number,
          password: hash
        });

        // Save the user
        newUser.save()
          .then((result) => {
            // Save user successful, now update the credit_score
            const userId = result._id;

            // Create a new credit_score document
            const branch = new branchModel({
              _id: new mongoose.Types.ObjectId(),
              branch_name: req.body.branch_name,
              branch_location: req.body.location
            });

            // Save the credit_score
            branch.save()
              .then(() => {
                // Update the user document with the new credit_score _id
                loanofficerModel.findByIdAndUpdate(userId, { $set: { branch: branch._id } })
                  .then(() => {
                    // User and credit_score updated successfully
                    const token = jwt.sign({
                      userType: "LoanOfficer",
                      loanOfficerId: userId,
                      name: req.body.name,
                      address: req.body.address,
                      email: req.body.email,
                      branch_name: req.body.branch_name,
                      branch_location: req.body.location,
                      officer_mobile_number: req.body.mobile_number

                    },
                      process.env.jwtSecret, {
                      expiresIn: "1d",
                    });

                    res.status(201).json({
                      message: "Loan Officer created",
                      userDetails: {
                        loanOfficerId: userId,
                        name: req.body.name,
                        address: req.body.address,
                        officer_mobile_number: req.body.mobile_number,
                        email: req.body.email,
                        branch_name: req.body.branch,
                        branch_location: req.body.location,

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
  console.log(req.body)

  loanofficerModel.findOne({ officer_email: req.body.email })
    .then((loanOfficer) => {
      console.log(loanOfficer)
      if (!loanOfficer) {
        return res.status(401).json({
          message: "Auth failed: Email not found probably",
        });
      }

      bcrypt.compare(req.body.password, loanOfficer.password, (err, result) => {
        if (err) {
          return res.status(401).json({
            message: "Auth failed",
          });
        }
        console.log(result)
        if (result) {
          const token = jwt.sign({
            userType: "Loan Officer",
            userId: loanOfficer._id,
            name: loanOfficer.officer_name,
            address: loanOfficer.address,
            email: loanOfficer.officer_email,
            mobile_number: loanOfficer.officer_mobile_number
          },
            process.env.jwtSecret, {
            expiresIn: "1d",
          });

          return res.status(200).json({
            message: "Auth successful",
            userDetails: {
              userType: "Loan Officer",
              name: loanOfficer.officer_name,
              address: loanOfficer.address,
              email: loanOfficer.officer_email,
              mobile_number: loanOfficer.officer_mobile_number,
            },
            token: token,
          });
        }

        res.status(401).json({
          message: "Auth failed: Incorrect password",
        });
      });
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});


router.get('/loanapplications', CheckAuthAdmin, async (req, res) => {
  try {
    const loanOfficerId = req.admin.userId

    // Find loan officer and populate loan applications with user and collateral details
    const loanOfficer = await loanofficerModel
      .findById(loanOfficerId)
      .populate({
        path: 'loan_applications.Loan_applicationId',
        model: 'Loan_application',
        populate: [
          {
            path: 'user',
            model: 'User',
          },
          {
            path: 'collateral',
            model: 'Collateral',
          },
        ],
      });
    if (!loanOfficer) {
      return res.status(404).json({
        message: 'Loan officer not found',
      });
    }
    console.log(loanOfficer, "Loan Officer")
    const loanApplications = loanOfficer.loan_applications.map(application => {
      const user = application.Loan_applicationId.user;
      const collateral = application.Loan_applicationId.collateral;

      return {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          mobile_number:user.mobile_number
        },
        collateral: {
          _id: collateral._id,
          collateral_type: collateral.collateral_type,
          collateral_value: collateral.collateral_value,
          collateral_description: collateral.collateral_description,

        },
        ApplicationId: application.Loan_applicationId?._id,
        app_status: application.Loan_applicationId?.app_status,
        amount_requested: application.Loan_applicationId?.amount_requested,
        start_date: application.Loan_applicationId?.start_date,
        end_date: application.Loan_applicationId?.end_date,
        purpose: application.Loan_applicationId?.purpose,
        loanId: application.Loan_applicationId?.loan
      };
    });

    res.status(200).json({
      message: 'Loan applications retrieved successfully',
      loanApplications,
    });
  } catch (error) {
    console.error('Error fetching loan applications:', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
});


router.post('/approve/:applicationId', CheckAuthAdmin, async (req, res) => {
  try {
    const applicationId = req.params.applicationId;

    // Fetch loan application details
    const loanApplication = await loanApplicationModel.findById(applicationId);

    if (!loanApplication) {
      return res.status(404).json({ message: 'Loan application not found' });
    }

    const loan_review = new ReviewModel({
      _id: new mongoose.Types.ObjectId(),
      reviewer_name: req.admin.name,
      comments: "Good Property Value"
    })
    await loan_review.save()

    // Update loan application status to 'Approved' and set the amount approved
    await loanApplicationModel.findByIdAndUpdate(applicationId, {
      $set: {
        app_status: 'Approved',
        amount_approved: req.body.amount_approved,
      },
    });

    // Create a new Loan document
    const newLoan = new LoanModel({
      _id: new mongoose.Types.ObjectId(),
      loan_type: loanApplication.purpose,
      amount_approved: req.body.amount_approved,
      rate_of_interest: 12,
      term: loanApplication.term,
      amount_remained: req.body.amount_approved,
      start_date: loanApplication.start_date,
      end_date: loanApplication.end_date,
      loanApplication: applicationId,
    });

    await newLoan.save();
    await loanApplicationModel.findByIdAndUpdate(applicationId, {
      $set: {
        loan: newLoan._id,
        loan_review: loan_review._id,
      },
    });


    // Create Loan Repayment Schedule
    const months = loanApplication.term; // Assuming term is in months
    const totalInterest = (+req.body.amount_approved * 12 * (months / 12)) / 100;
    const totalprincipal = +req.body.amount_approved;
    const repaymentSchedule = [];
    const interestAmount = totalInterest / months
    const principalAmount = totalprincipal / months
    const totalPermonth = interestAmount + principalAmount

    await LoanModel.findByIdAndUpdate(newLoan._id, { $set: { amount_remained: totalInterest + totalprincipal } })

    for (let i = 1; i <= months; i++) {

      const dueDate = new Date(loanApplication.app_date);
      dueDate.setMonth(dueDate.getMonth() + i);

      const installment = new LoanRepaymentScheduleModel({
        _id: new mongoose.Types.ObjectId(),
        installment_number: i,
        due_date: dueDate,
        principal_amount: principalAmount,
        interest_amount: interestAmount,
        amount_due: totalPermonth,
        loan: newLoan._id,
      });


      repaymentSchedule.push(installment);
    }
    await LoanModel.findByIdAndUpdate(newLoan._id, { $set: { loan_repayment_schedule: repaymentSchedule.map((s) => s._id) } })

    // Save Loan Repayment Schedule
    await LoanRepaymentScheduleModel.insertMany(repaymentSchedule);

    res.status(200).json({ message: 'Loan application approved successfully' });
  } catch (error) {
    console.error('Error approving loan application:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/reject/:applicationId', CheckAuthAdmin, async (req, res) => {
  try {
    const applicationId = req.params.applicationId;


    const loan_review = new ReviewModel({
      _id: new mongoose.Types.ObjectId(),
      reviewer_name: req.admin.name,
      comments: "Not Good Property Value"
    })
    await loan_review.save()


    // Fetch loan application details
    const loanApplication = await loanApplicationModel.findById(applicationId);

    if (!loanApplication) {
      return res.status(404).json({ message: 'Loan application not found' });
    }

    // Update loan application status to 'Approved' and set the amount approved
    await loanApplicationModel.findByIdAndUpdate(applicationId, {
      $set: {
        app_status: 'Rejected',
        loan_review: loan_review._id
      }
    });

    res.status(200).json({ message: 'Loan application rejected successfully' });
  } catch (error) {
    console.error('Error approving loan application:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


module.exports = router;