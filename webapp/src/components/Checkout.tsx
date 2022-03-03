import * as React from "react";

import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { updateProduct } from "../api/api";
import { CartItem } from "../shared/shareddtypes";

import ShippingCosts from "./ShippingCosts";
import Review from "./Review";

function getSteps() {
  return ["Shipping address", "Review your order"];
}

export default function Checkout(props: any) {
  const [activeStep, setActiveStep] = React.useState(0);
  const [isCostsCalculated, setCostsCalculated] =
    React.useState<boolean>(false);
  const [costs, setCosts] = React.useState<number>(Number());

  const steps = getSteps();

  const handleUpdateStock = () => {
    props.productsCart.forEach((cartItem: CartItem) => {
      let productUnits: number = cartItem.amount;
      cartItem.product.stock -= productUnits;
      updateProduct(cartItem.product);
    });
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);

    // when we click FINISH button ==> update the stock
    if (activeStep === steps.length - 1) {
      handleUpdateStock();
      console.log("asd");

      // redirect to home...
      document.location.href = "/";
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setCostsCalculated(false);
    setCosts(Number());
  };

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <ShippingCosts
            handleCosts={setCosts}
            costs={costs}
            handleCostsCalculated={setCostsCalculated}
            isCostsCalculated={isCostsCalculated}
          />
        );
      case 1:
        return (
          <Review productsCart={props.productsCart} shippingCosts={costs} />
        );
    }
  };

  return (
    <React.Fragment>
      <Container component="main" maxWidth="sm" sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}
        >
          <Typography component="h1" variant="h4" align="center">
            Checkout
          </Typography>
          <Stepper
            activeStep={activeStep}
            sx={{ pt: 3, pb: 5 }}
            alternativeLabel
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <React.Fragment>{getStepContent(activeStep)}</React.Fragment>

          <Stack
            sx={{ pt: 2 }}
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
              className="m-1"
            >
              Back
            </Button>

            <Button
              disabled={!isCostsCalculated}
              variant="contained"
              onClick={handleNext}
              className="m-1"
            >
              {activeStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </React.Fragment>
  );
}