import { useScaffoldContractWrite } from "../scaffold-eth";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { toHex } from "viem";
import { PropertyTypeOptions } from "~~/constants";
import { PropertyRegistrationModel } from "~~/models/property-registration.model";
import { indexOfLiteral } from "~~/utils/extract-values";
import { uploadFile, uploadJson } from "~~/utils/ipfs";
import { notification } from "~~/utils/scaffold-eth";

export const useDeedNftMint = () => {
  const { primaryWallet } = useDynamicContext();

  const contractWritePayload = useScaffoldContractWrite({
    contractName: "DeedNFT",
    functionName: "mintAsset",
    args: [] as any, // Will be filled in by write()
  });

  const writeAsync = async (data: PropertyRegistrationModel) => {
    if (!primaryWallet) {
      notification.error("No wallet connected");
      return;
    }

    const toastId = notification.loading("Uploading documents...");

    // Owner informations docs
    const ids = await uploadFile(data.ownerInformation.ids, "ID or Passport");

    const proofBill = data.ownerInformation?.proofBill
      ? await uploadFile(data.ownerInformation?.proofBill, "Utility Bill or Other Document")
      : undefined;

    const articleIncorporation = await uploadFile(
      data.ownerInformation.articleIncorporation,
      "Acrticle of Incorporation",
    );

    const operatingAgreement = data.ownerInformation?.operatingAgreement
      ? await uploadFile(data.ownerInformation.operatingAgreement, "Operating Agreement")
      : undefined;

    const supportingDoc = data.ownerInformation?.supportingDoc
      ? await Promise.all(
          data.ownerInformation.supportingDoc.map((doc, i) =>
            uploadFile(doc, "Any other Supporting Documents #" + i),
          ),
        )
      : undefined;

    // Property details docs
    const propertyImages = data.propertyDetails?.propertyImages
      ? await uploadFile(data.propertyDetails.propertyImages, "Property Images")
      : undefined;

    const propertyDeedOrTitle = await uploadFile(
      data.propertyDetails.propertyDeedOrTitle,
      "Deed or Title",
    );

    const propertyPurchaseContract = data.propertyDetails?.propertyPurchaseContract
      ? await uploadFile(data.propertyDetails.propertyPurchaseContract, "Purchase Contract")
      : undefined;

    notification.remove(toastId);

    const deedInfo = cleanObject({
      ownerInformation: {
        ...data.ownerInformation,
        ids,
        proofBill,
        articleIncorporation,
        operatingAgreement,
        supportingDoc,
      },
      propertyDetails: {
        ...data.propertyDetails,
        propertyImages,
        propertyDeedOrTitle,
        propertyPurchaseContract,
      },
      otherInformation: data.otherInformation,
    });

    const propertyHash = await uploadJson(deedInfo);
    console.debug("DeedInfo with hash: ", propertyHash.toString(), { deedInfo });

    await contractWritePayload.writeAsync({
      args: [
        primaryWallet.address,
        toHex(propertyHash.toString()),
        indexOfLiteral(PropertyTypeOptions, data.propertyDetails.propertyType),
        data.propertyDetails.propertyAddress,
      ],
    });
  };

  return { ...contractWritePayload, writeAsync };
};

function cleanObject(obj: any) {
  Object.keys(obj).forEach(key => {
    if (obj[key] && typeof obj[key] === "object") cleanObject(obj[key]);
    else if (obj[key] === undefined) delete obj[key]; // or set to null
  });
  return obj;
}
