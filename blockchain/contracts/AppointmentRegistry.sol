// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AppointmentRegistry
 * @dev Smart contract để lưu hash của appointment records
 * Mục đích: Đảm bảo tính toàn vẹn dữ liệu, chống giả mạo
 */
contract AppointmentRegistry {
    // Struct lưu thông tin appointment hash
    struct AppointmentRecord {
        string appointmentId;      // MongoDB _id
        bytes32 dataHash;          // SHA256 hash của appointment data
        uint256 timestamp;         // Thời gian lưu lên blockchain
        address submittedBy;       // Địa chỉ wallet submit
        bool exists;               // Flag kiểm tra record có tồn tại
    }
    
    // Mapping: appointmentId => AppointmentRecord
    mapping(string => AppointmentRecord) private appointmentRecords;
    
    // Mapping: appointmentId => array of hashes (lịch sử thay đổi)
    mapping(string => bytes32[]) private appointmentHistory;
    
    // Events
    event AppointmentStored(
        string indexed appointmentId,
        bytes32 dataHash,
        uint256 timestamp,
        address submittedBy
    );
    
    event AppointmentUpdated(
        string indexed appointmentId,
        bytes32 oldHash,
        bytes32 newHash,
        uint256 timestamp,
        address submittedBy
    );
    
    /**
     * @dev Lưu hash của appointment lên blockchain (lần đầu)
     * @param appointmentId MongoDB _id của appointment
     * @param dataHash SHA256 hash của appointment data
     */
    function storeAppointmentHash(
        string memory appointmentId,
        bytes32 dataHash
    ) public {
        require(bytes(appointmentId).length > 0, "Appointment ID cannot be empty");
        require(dataHash != bytes32(0), "Data hash cannot be empty");
        require(!appointmentRecords[appointmentId].exists, "Appointment already exists");
        
        // Lưu record mới
        appointmentRecords[appointmentId] = AppointmentRecord({
            appointmentId: appointmentId,
            dataHash: dataHash,
            timestamp: block.timestamp,
            submittedBy: msg.sender,
            exists: true
        });
        
        // Lưu vào history
        appointmentHistory[appointmentId].push(dataHash);
        
        emit AppointmentStored(appointmentId, dataHash, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Cập nhật hash khi appointment thay đổi
     * @param appointmentId MongoDB _id của appointment
     * @param newDataHash SHA256 hash mới của appointment data
     */
    function updateAppointmentHash(
        string memory appointmentId,
        bytes32 newDataHash
    ) public {
        require(bytes(appointmentId).length > 0, "Appointment ID cannot be empty");
        require(newDataHash != bytes32(0), "Data hash cannot be empty");
        require(appointmentRecords[appointmentId].exists, "Appointment does not exist");
        
        bytes32 oldHash = appointmentRecords[appointmentId].dataHash;
        
        // Cập nhật hash mới
        appointmentRecords[appointmentId].dataHash = newDataHash;
        appointmentRecords[appointmentId].timestamp = block.timestamp;
        appointmentRecords[appointmentId].submittedBy = msg.sender;
        
        // Lưu vào history
        appointmentHistory[appointmentId].push(newDataHash);
        
        emit AppointmentUpdated(appointmentId, oldHash, newDataHash, block.timestamp, msg.sender);
    }
    
    /**
     * @dev Verify hash của appointment có khớp với blockchain không
     * @param appointmentId MongoDB _id của appointment
     * @param dataHash SHA256 hash cần verify
     * @return bool True nếu hash khớp, False nếu không khớp
     */
    function verifyAppointmentHash(
        string memory appointmentId,
        bytes32 dataHash
    ) public view returns (bool) {
        if (!appointmentRecords[appointmentId].exists) {
            return false;
        }
        return appointmentRecords[appointmentId].dataHash == dataHash;
    }
    
    /**
     * @dev Lấy thông tin appointment record từ blockchain
     * @param appointmentId MongoDB _id của appointment
     * @return appointmentId, dataHash, timestamp, submittedBy
     */
    function getAppointmentRecord(
        string memory appointmentId
    ) public view returns (
        string memory,
        bytes32,
        uint256,
        address
    ) {
        require(appointmentRecords[appointmentId].exists, "Appointment does not exist");
        
        AppointmentRecord memory record = appointmentRecords[appointmentId];
        return (
            record.appointmentId,
            record.dataHash,
            record.timestamp,
            record.submittedBy
        );
    }
    
    /**
     * @dev Lấy lịch sử thay đổi hash của appointment
     * @param appointmentId MongoDB _id của appointment
     * @return Array of hashes
     */
    function getAppointmentHistory(
        string memory appointmentId
    ) public view returns (bytes32[] memory) {
        require(appointmentRecords[appointmentId].exists, "Appointment does not exist");
        return appointmentHistory[appointmentId];
    }
    
    /**
     * @dev Kiểm tra appointment có tồn tại trên blockchain không
     * @param appointmentId MongoDB _id của appointment
     * @return bool True nếu tồn tại
     */
    function appointmentExists(
        string memory appointmentId
    ) public view returns (bool) {
        return appointmentRecords[appointmentId].exists;
    }
}
