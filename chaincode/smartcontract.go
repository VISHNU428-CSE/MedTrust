package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SmartContract provides functions for managing MedTrust EHRs & Consents
type SmartContract struct {
	contractapi.Contract
}

type RecordMetadata struct {
	RecordID          string `json:"recordId"`
	PatientID         string `json:"patientId"`
	IPFSCid           string `json:"ipfsCid"`
	Title             string `json:"title"`
	RecordType        string `json:"recordType"`
	EncryptionKeyHash string `json:"encryptionKeyHash"`
	CreatedAt         string `json:"createdAt"`
	CreatedTxID       string `json:"createdTxId"`
}

type ConsentState struct {
	ConsentID    string   `json:"consentId"`
	PatientID    string   `json:"patientId"`
	DoctorID     string   `json:"doctorId"`
	Scope        string   `json:"scope"` // ALL_RECORDS | DIAGNOSTIC_ONLY | SPECIFIC_RECORDS
	RecordIDs    []string `json:"recordIds,omitempty"`
	Purpose      string   `json:"purpose"`
	ValidUntil   string   `json:"validUntil"`
	Status       string   `json:"status"` // ACTIVE | REVOKED | EXPIRED
	RevokedAt    string   `json:"revokedAt,omitempty"`
	RevokeReason string   `json:"revokeReason,omitempty"`
}

type AccessAuditLog struct {
	TxID      string `json:"txId"`
	RecordID  string `json:"recordId"`
	DoctorID  string `json:"doctorId"`
	PatientID string `json:"patientId"`
	Status    string `json:"status"` // AUTHORIZED | DENIED_UNAUTHORIZED
	Purpose   string `json:"purpose"`
	Timestamp string `json:"timestamp"`
}

// CreateRecord anchors an EHR's IPFS CID and cryptographic hash to the ledger
func (s *SmartContract) CreateRecord(ctx contractapi.TransactionContextInterface, recordID string, patientID string, ipfsCid string, title string, recordType string, encHash string) error {
	txID := ctx.GetStub().GetTxID()
	timestamp, _ := ctx.GetStub().GetTxTimestamp()
	createdAt := time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).UTC().Format(time.RFC3339)

	record := RecordMetadata{
		RecordID:          recordID,
		PatientID:         patientID,
		IPFSCid:           ipfsCid,
		Title:             title,
		RecordType:        recordType,
		EncryptionKeyHash: encHash,
		CreatedAt:         createdAt,
		CreatedTxID:       txID,
	}

	recordJSON, err := json.Marshal(record)
	if err != nil {
		return err
	}

	return ctx.GetStub().PutState("REC_"+recordID, recordJSON)
}

// GrantConsent records a patient consent grant transaction
func (s *SmartContract) GrantConsent(ctx contractapi.TransactionContextInterface, consentID string, patientID string, doctorID string, scope string, validUntil string, purpose string) error {
	consent := ConsentState{
		ConsentID:  consentID,
		PatientID:  patientID,
		DoctorID:   doctorID,
		Scope:      scope,
		Purpose:    purpose,
		ValidUntil: validUntil,
		Status:     "ACTIVE",
	}

	consentJSON, err := json.Marshal(consent)
	if err != nil {
		return err
	}

	key := fmt.Sprintf("CNS_%s_%s", patientID, doctorID)
	return ctx.GetStub().PutState(key, consentJSON)
}

// RevokeConsent updates consent status to REVOKED
func (s *SmartContract) RevokeConsent(ctx contractapi.TransactionContextInterface, consentID string, patientID string, doctorID string, reason string) error {
	key := fmt.Sprintf("CNS_%s_%s", patientID, doctorID)
	consentBytes, err := ctx.GetStub().GetState(key)
	if err != nil || consentBytes == nil {
		return fmt.Errorf("consent record not found on ledger")
	}

	var consent ConsentState
	json.Unmarshal(consentBytes, &consent)

	consent.Status = "REVOKED"
	timestamp, _ := ctx.GetStub().GetTxTimestamp()
	consent.RevokedAt = time.Unix(timestamp.Seconds, int64(timestamp.Nanos)).UTC().Format(time.RFC3339)
	consent.RevokeReason = reason

	updatedJSON, _ := json.Marshal(consent)
	return ctx.GetStub().PutState(key, updatedJSON)
}

// CheckConsent queries the ledger to verify active authorization
func (s *SmartContract) CheckConsent(ctx contractapi.TransactionContextInterface, recordID string, doctorID string) (string, error) {
	recordBytes, err := ctx.GetStub().GetState("REC_" + recordID)
	if err != nil || recordBytes == nil {
		return "", fmt.Errorf("record does not exist")
	}

	var record RecordMetadata
	json.Unmarshal(recordBytes, &record)

	key := fmt.Sprintf("CNS_%s_%s", record.PatientID, doctorID)
	consentBytes, err := ctx.GetStub().GetState(key)
	if err != nil || consentBytes == nil {
		return "", fmt.Errorf("no consent record exists between patient and doctor")
	}

	var consent ConsentState
	json.Unmarshal(consentBytes, &consent)

	if consent.Status != "ACTIVE" {
		return "", fmt.Errorf("consent has been revoked or is inactive")
	}

	return record.IPFSCid, nil
}

func main() {
	cc, err := contractapi.NewChaincode(&SmartContract{})
	if err != nil {
		fmt.Printf("Error creating MedTrust chaincode: %s", err)
		return
	}

	if err := cc.Start(); err != nil {
		fmt.Printf("Error starting chaincode: %s", err)
	}
}
