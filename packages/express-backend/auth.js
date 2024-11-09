import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import express from 'express';
import Account from "./models/account.js";
import { sendVerificationMail } from './sendVerifEmail.js';

const router = express.Router();

function generateAccessToken(calpoly_email) {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { calpoly_email: calpoly_email },
      process.env.TOKEN_SECRET,
      { expiresIn: "1d" },
      (error, token) => {
        if (error) {
          reject(error);
        } else {
          resolve(token);
        }
      }
    );
  });
}

export function authenticateUser(req, res, next) {
  const authHeader = req.headers["authorization"];
  // Getting the 2nd part of the auth header (the token)
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token received");
    res.status(401).end();
  } else {
    jwt.verify(token, process.env.TOKEN_SECRET, (error, decoded) => {
      if (decoded) {
        next();
      } else {
        console.log("JWT error:", error);
        res.status(401).end();
      }
    });
  }
}

export function registerUser(req, res) {
  const { calpoly_email, password } = req.body;

  if (!calpoly_email || !password) {
    res.status(400).send("Bad request: Invalid input data.");
    return;
  }

  // Check if the email has the correct domain
  const validDomain = "@calpoly.edu";
  if (!calpoly_email.endsWith(validDomain)) {
    res.status(400).send({ error: "Signup Error: Invalid email domain. Only @calpoly.edu emails are allowed." });
    return;
  }

  Account.findOne({ calpoly_email }).then((existingUser) => {
    if (existingUser) {
      return res.status(409).send("Email already in use");
    } else {
      bcrypt
        .genSalt(10)
        .then((salt) => bcrypt.hash(password, salt))
        .then((hashedPassword) => {
          const newUser = new Account({ calpoly_email, password: hashedPassword });
          newUser.save().then(() => {
            // Generate a verification token
            const verificationToken = jwt.sign(
              { calpoly_email },
              process.env.TOKEN_SECRET,
              { expiresIn: '1h' }
            );

            // Send the verification email
            sendVerificationMail({ email: calpoly_email, name: calpoly_email, emailToken: verificationToken })
              .then(() => {
                res.status(201).send("Account created. Verification email sent.");
              })
              .catch((error) => {
                console.log("Error sending verification email:", error);
                res.status(500).send("Account created but failed to send verification email.");
              });
          });
        })
        .catch((error) => res.status(500).send("Error creating user"));
    }
  });
}

export function loginUser(req, res) {
  const { calpoly_email, password } = req.body;

  Account.findOne({ calpoly_email }).then((user) => {
    if (!user) {
      return res.status(401).send("Unauthorized");
    }

    bcrypt.compare(password, user.password).then((matched) => {
      if (matched) {
        generateAccessToken(calpoly_email).then((token) => {
          res.status(200).send({ token });
        });
      } else {
        res.status(401).send("Unauthorized");
      }
    });
  });
}

// Route to verify email token
router.get('/verify-email', (req, res) => {
  const token = req.query.token;
  console.log('Received token for verification:', token); // Debugging line

  if (!token) {
    return res.status(400).send('No token provided');
  }

  // Verify the token using the secret key
  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log('Token verification error:', err); // Debugging line
      return res.status(400).send('Invalid or expired token');
    }

    // Check the decoded payload
    console.log('Decoded token payload:', decoded); // Debugging line

    // Logic to mark the user as verified
    Account.findOneAndUpdate(
      { calpoly_email: decoded.calpoly_email },
      { isVerified: true },
      { new: true }
    )
      .then((updatedUser) => {
        if (updatedUser) {
          console.log('User verification updated successfully:', updatedUser); // Debugging line
          res.status(200).send('Email verified successfully');
        } else {
          console.log('User not found for verification'); // Debugging line
          res.status(404).send('User not found');
        }
      })
      .catch((error) => {
        console.log('Error updating user:', error); // Debugging line
        res.status(500).send('Internal server error');
      });
  });
});

export default router;
