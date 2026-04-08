import { Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import StatusPill from "./StatusPill";

function ReceiptCard({ receipt }) {
  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
      <div className="mb-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-accent-teal">
          Smart Canteen
        </p>
        <h1 className="mt-3 text-3xl font-black text-slate-900">Payment Receipt</h1>
      </div>

      <div className="mb-6 flex justify-center">
        <StatusPill status={receipt.status} />
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex justify-between border-b border-slate-200 pb-3">
          <span className="text-slate-500">Receipt No.</span>
          <span className="font-mono font-semibold text-slate-900">{receipt.receiptNo}</span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-3">
          <span className="text-slate-500">Paid At</span>
          <span className="text-slate-900">
            {new Date(receipt.paidAt || receipt.createdAt).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between border-b border-slate-200 pb-3">
          <span className="text-slate-500">Method</span>
          <span className="text-slate-900">{receipt.method?.replaceAll("_", " ")}</span>
        </div>
      </div>

      <div className="mb-8 space-y-3">
        {receipt.items?.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
          >
            <div>
              <p className="font-semibold text-slate-900">{item.name}</p>
              <p className="text-sm text-slate-500">Qty: {item.qty}</p>
            </div>
            <span className="font-semibold text-slate-900">
              Rs {(item.price * item.qty).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-8 flex items-center justify-between border-t-2 border-accent-green pt-4">
        <span className="text-xl font-bold text-slate-900">Total</span>
        <span className="text-2xl font-black text-accent-teal">
          Rs {receipt.totalAmount?.toFixed(2)}
        </span>
      </div>

      {receipt.status === "PAID" && receipt.tokenRef && (
        <div className="mb-8 rounded-3xl bg-slate-900 px-6 py-8 text-center text-white">
          <h3 className="text-lg font-bold">Pickup Token</h3>
          <div className="mx-auto mt-5 inline-block rounded-2xl bg-white p-4">
            <QRCodeSVG value={receipt.tokenRef} size={180} />
          </div>
          <p className="mt-4 font-mono text-3xl font-black tracking-wider text-accent-green">
            {receipt.tokenRef}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={() => window.print()}
        className="no-print flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-teal px-6 py-4 font-semibold text-white transition-colors hover:bg-[#c86435]"
      >
        <Printer size={18} />
        Print Receipt
      </button>
    </div>
  );
}

export default ReceiptCard;
