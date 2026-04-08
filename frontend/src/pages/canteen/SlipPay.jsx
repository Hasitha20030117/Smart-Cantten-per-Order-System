import { FileText } from "lucide-react";
import { API_BASE_URL } from "../../lib/axios";
import { ProofUploadPage } from "./QrPay";

function SlipPay() {
  return (
    <ProofUploadPage
      title="Bank Slip Payment"
      icon={FileText}
      paymentType="slip"
      apiBaseUrl={API_BASE_URL}
    />
  );
}

export default SlipPay;
