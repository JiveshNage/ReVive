import React, { useState } from 'react';
import { Lot, Material, UserProfile } from '../../types';

export interface RecyclerPaymentTerminalProps {
  currentUser: UserProfile | null;
  lots: Lot[];
  materials: Material[];
  selectedLotId?: number;
  verifiedWeightKg?: number;
  totalAmountInr?: number;
  onPaymentSettled: (lotId: number, utrNumber: string, passportId: string) => void;
  openPassport: (lotId: number | string) => void;
}

export const RecyclerPaymentTerminal: React.FC<RecyclerPaymentTerminalProps> = ({
  currentUser,
  lots,
  materials,
  selectedLotId = 102,
  verifiedWeightKg = 5.4,
  totalAmountInr = 2176.2,
  onPaymentSettled,
  openPassport,
}) => {
  const [activeLotId, setActiveLotId] = useState<number>(selectedLotId);
  const [paymentRail, setPaymentRail] = useState<'upi' | 'imps' | 'escrow'>('upi');
  const [upiVpa, setUpiVpa] = useState<string>('ram.yadav@upi');
  const [bankAccount, setBankAccount] = useState<string>('State Bank of India ······8812');
  const [ifscCode, setIfscCode] = useState<string>('SBIN0001240');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [completedTxn, setCompletedTxn] = useState<{
    utr: string;
    passportId: string;
    timestamp: string;
  } | null>(null);

  const lot = lots.find((l) => l.id === activeLotId) || lots[0];
  const material = materials.find((m) => m.id === lot?.material_id) || materials[0];
  const mspRate = lot?.id === 102 ? 403 : lot?.id === 103 ? 210 : 145;
  const payoutAmount = totalAmountInr || Number((verifiedWeightKg * mspRate).toFixed(2));

  const handleAuthorizePayment = () => {
    setIsProcessing(true);

    setTimeout(() => {
      const generatedUtr =
        paymentRail === 'upi'
          ? `UPI/REV/2026/${Math.floor(100000 + Math.random() * 900000)}`
          : paymentRail === 'imps'
          ? `IMPS/REV/2026/${Math.floor(100000 + Math.random() * 900000)}`
          : `ESCROW/REV/2026/${Math.floor(100000 + Math.random() * 900000)}`;

      const passportCode = `REV-2026-LOT-0${lot?.id || 102}`;
      const now = new Date().toLocaleTimeString();

      setCompletedTxn({
        utr: generatedUtr,
        passportId: passportCode,
        timestamp: now,
      });

      setIsProcessing(false);
      onPaymentSettled(lot.id, generatedUtr, passportCode);
    }, 1200);
  };

  return (
    <div className="payment-terminal-wrapper">
      {/* Top Banner */}
      <div className="payment-header-banner">
        <div>
          <span className="badge-recycler-hub">SECURE FINANCIAL CLEARINGHOUSE · CPCB ESCROW GATEWAY</span>
          <h2>Payment Settlement & Instant Payout Authorization Console</h2>
          <p>
            Disburse immediate, verified remuneration directly into the informal collector’s bank account or UPI handle upon certified digital scale handover.
          </p>
        </div>

        <div className="escrow-badge">
          <span className="icon">🔒</span>
          <div>
            <strong>ESCROW SECURED: ₹ 2,50,000</strong>
            <small>Pre-funded CPCB EPR Deposit</small>
          </div>
        </div>
      </div>

      <div className="terminal-content-layout">
        {/* Left Column: Settlement Invoice Breakdown */}
        <div className="invoice-summary-card">
          <h3>Handover Settlement Invoice</h3>
          <p className="subtext">Review certified weights and statutory rates prior to releasing payment:</p>

          <div className="invoice-lot-info">
            <div className="lot-badge">
              <span>LOT #{lot?.id}</span>
              <strong>{material.name}</strong>
            </div>

            <div className="collector-meta">
              <span>Recipient Collector:</span>
              <strong>Ram Yadav (REV-COL-2026-1024)</strong>
              <small>Scrap Yard: Karond Mandi, Bhopal</small>
            </div>
          </div>

          <div className="calculation-breakdown-table">
            <div className="calc-row">
              <span>Verified Net Weight:</span>
              <strong>{verifiedWeightKg} kg</strong>
            </div>
            <div className="calc-row">
              <span>CPCB Statutory Minimum Rate (MSP):</span>
              <strong>₹ {mspRate} / kg</strong>
            </div>
            <div className="calc-row">
              <span>Informal Formalization Bonus (EPR):</span>
              <strong className="green">+ ₹ 0.00 (Zero Deductions)</strong>
            </div>
            <div className="calc-row divider"></div>
            <div className="calc-row grand-total">
              <span>Total Payout Payable:</span>
              <strong className="amount">₹ {payoutAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            </div>
          </div>

          <div className="cpcb-compliance-guarantee">
            <span>🛡️ CPCB Fair Pricing Guarantee: 100% compliant with statutory e-waste benchmark rates.</span>
          </div>
        </div>

        {/* Right Column: Payment Method Selection & Authorization */}
        <div className="payment-rails-card">
          {!completedTxn ? (
            <>
              <h3>Select Payout Rail & Authorize Transfer</h3>

              {/* Payment Rail Selector Tabs */}
              <div className="rails-selector-tabs">
                <button
                  type="button"
                  className={paymentRail === 'upi' ? 'active' : ''}
                  onClick={() => setPaymentRail('upi')}
                >
                  ⚡ Instant UPI (NPCI)
                </button>
                <button
                  type="button"
                  className={paymentRail === 'imps' ? 'active' : ''}
                  onClick={() => setPaymentRail('imps')}
                >
                  🏦 Direct Bank IMPS
                </button>
                <button
                  type="button"
                  className={paymentRail === 'escrow' ? 'active' : ''}
                  onClick={() => setPaymentRail('escrow')}
                >
                  🔒 CPCB Escrow Auto-Release
                </button>
              </div>

              {/* Dynamic Inputs Based on Selected Rail */}
              {paymentRail === 'upi' && (
                <div className="rail-input-box">
                  <label>Collector UPI ID / VPA Handle:</label>
                  <div className="input-with-icon">
                    <span className="input-icon">@</span>
                    <input
                      type="text"
                      value={upiVpa}
                      onChange={(e) => setUpiVpa(e.target.value)}
                      placeholder="e.g. ram.yadav@upi"
                    />
                  </div>
                  <small className="hint">
                    ✓ Verified Name: <strong>Ram Yadav (State Bank of India)</strong>
                  </small>
                </div>
              )}

              {paymentRail === 'imps' && (
                <div className="rail-input-box">
                  <label>Recipient Bank Account & IFSC:</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Account Number"
                  />
                  <div className="ifsc-row" style={{ marginTop: '8px' }}>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      placeholder="IFSC Code"
                    />
                    <small className="hint">✓ IFSC: SBI Karond Branch, Bhopal</small>
                  </div>
                </div>
              )}

              {paymentRail === 'escrow' && (
                <div className="escrow-instruction-box">
                  <p>
                    Releases pre-authorized funds from your facility's CPCB regulatory deposit directly to the collector's Aadhaar-linked bank account without intermediary processing fees.
                  </p>
                  <div className="escrow-balance-row">
                    <span>Available Escrow Balance:</span>
                    <strong>₹ 2,50,000.00</strong>
                  </div>
                </div>
              )}

              {/* Authorize Transfer Button */}
              <button
                type="button"
                className={`authorize-payment-btn ${isProcessing ? 'processing' : ''}`}
                disabled={isProcessing}
                onClick={handleAuthorizePayment}
              >
                {isProcessing
                  ? '⚡ Authorizing Payment with Banking Gateway...'
                  : `Release ₹ ${payoutAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} to Collector →`}
              </button>

              <div className="security-notice">
                <span>🔒 256-Bit Encrypted · Instant Bank Reconciliation · Generates CPCB Digital Passport</span>
              </div>
            </>
          ) : (
            /* Payment Success & Receipt Voucher */
            <div className="payment-success-card">
              <div className="success-icon">✓</div>
              <h3>Payment Settled Successfully!</h3>
              <p>Direct bank transfer executed in 1.2 seconds without fee deductions.</p>

              <div className="transaction-receipt-box">
                <div className="receipt-row">
                  <span>Banking Reference (UTR):</span>
                  <strong className="utr-text">{completedTxn.utr}</strong>
                </div>
                <div className="receipt-row">
                  <span>Amount Credited:</span>
                  <strong className="amount-text">₹ {payoutAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                </div>
                <div className="receipt-row">
                  <span>Settlement Timestamp:</span>
                  <strong>{completedTxn.timestamp}</strong>
                </div>
                <div className="receipt-row">
                  <span>CPCB Waste Passport:</span>
                  <strong className="passport-text">{completedTxn.passportId}</strong>
                </div>
              </div>

              <div className="success-actions-row">
                <button
                  type="button"
                  className="view-passport-btn"
                  onClick={() => openPassport(lot.id)}
                >
                  📜 Inspect Issued CPCB Digital Waste Passport →
                </button>

                <button
                  type="button"
                  className="download-tax-invoice-btn"
                  onClick={() => alert(`✓ Tax Invoice for Lot #${lot.id} downloaded successfully.`)}
                >
                  📥 Download Formal Tax Invoice (PDF)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
