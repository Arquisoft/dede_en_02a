import { render, fireEvent, act, screen } from "@testing-library/react";
import AddAddressDialog from "../../../components/dashboard/account/AddAddressDialog";
import * as solidHelper from "../../../helpers/SolidHelper";

test("AddAddressDialog renders correctly", async () => {
  jest.spyOn(solidHelper, "addAddressToPod").mockImplementation(() => {
    return Promise.resolve({} as any);
  });

  let setRefreshComponent = jest.fn();
  render(
    <AddAddressDialog
      open={true}
      webId={"https://test.webId.com"}
      handleOpen={() => {}}
      handleClose={() => {}}
      sendNotification={() => {}}
      setRefreshComponent={setRefreshComponent}
    />
  );

  expect(
    screen.getByText("Fill the form in order you to add a new address!")
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      "Notice that the following will be stored in a decentralized way. Meaning we won't store any of this information. It will be registered as a new address in your POD."
    )
  ).toBeInTheDocument();

  //Change the street address
  fireEvent.change(document.querySelector("input[name='street']")!, {
    target: { value: "New street" },
  });

  //Check the street address has been changed
  expect(
    (document.getElementsByName("street")[0] as HTMLInputElement).value
  ).toBe("New street");

  //Change the postal code
  await act(async () => {
    fireEvent.change(document.querySelector("input[name='postalCode']")!, {
      target: { value: "33210" },
    });
  });

  //Check the postal code has been changed
  expect(
    (document.getElementsByName("postalCode")[0] as HTMLInputElement).value
  ).toBe("33210");

  //Change the locality
  await act(async () => {
    fireEvent.change(document.querySelector("input[name='city']")!, {
      target: { value: "New city" },
    });
  });

  //Check the locality has been changed
  expect(
    (document.getElementsByName("city")[0] as HTMLInputElement).value
  ).toBe("New city");

  //Change the region
  await act(async () => {
    fireEvent.change(document.querySelector("input[name='region']")!, {
      target: { value: "New region" },
    });
  });

  //Check the region has been changed
  expect(
    (document.getElementsByName("region")[0] as HTMLInputElement).value
  ).toBe("New region");

  //Change the country
  await act(async () => {
    fireEvent.change(document.querySelector("input[name='country']")!, {
      target: { value: "New country" },
    });
  });

  //Check the country has been changed
  expect(
    (document.getElementsByName("country")[0] as HTMLInputElement).value
  ).toBe("New country");

  //Check that the save button appears
  expect(screen.getByText("Save my information")).toBeInTheDocument();

  //Click on the save button
  await act(async () => {
    fireEvent.click(screen.getByText("Save my information"));
  });

  //Check refreshComponent has been called
  expect(setRefreshComponent).toHaveBeenCalled();

  //Change the mock to give an error
  jest.spyOn(solidHelper, "addAddressToPod").mockImplementation(() => {
    return Promise.reject({} as any);
  });

  //Click on the save button
  await act(async () => {
    fireEvent.click(screen.getByText("Save my information"));
  });

  expect(setRefreshComponent).toHaveBeenCalledTimes(1);
});
