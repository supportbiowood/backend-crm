-- phpMyAdmin SQL Dump
-- version 4.9.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 25, 2021 at 03:50 AM
-- Server version: 5.7.32
-- PHP Version: 7.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `biowood_erp`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `account_id` int(11) NOT NULL,
  `account_no` varchar(255) DEFAULT NULL,
  `account_type` varchar(255) DEFAULT NULL,
  `account_name` varchar(255) DEFAULT NULL,
  `account_description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`account_id`, `account_no`, `account_type`, `account_name`, `account_description`) VALUES
(1, '1234', 'บัญชีออมทรัพย์', 'ABC', 'AAA'),
(2, '5678', 'บัญชีออมทรัพย์', 'DEF', 'BBB');

-- --------------------------------------------------------

--
-- Table structure for table `address`
--

CREATE TABLE `address` (
  `address_id` int(11) NOT NULL,
  `address_name` varchar(255) DEFAULT NULL,
  `building` varchar(255) DEFAULT NULL,
  `house_no` varchar(255) DEFAULT NULL,
  `road` varchar(255) DEFAULT NULL,
  `village_no` varchar(255) DEFAULT NULL,
  `sub_district` varchar(255) DEFAULT NULL,
  `district` varchar(255) DEFAULT NULL,
  `province` varchar(255) DEFAULT NULL,
  `country` varchar(255) DEFAULT NULL,
  `postal_code` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `address`
--

INSERT INTO `address` (`address_id`, `address_name`, `building`, `house_no`, `road`, `village_no`, `sub_district`, `district`, `province`, `country`, `postal_code`) VALUES
(1, 'A', 'B', 'C', 'D', 'E', 'F', 'H', 'H', 'I', 'J'),
(2, 'AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG', 'HH', 'II', 'JJ');

-- --------------------------------------------------------

--
-- Table structure for table `attachment`
--

CREATE TABLE `attachment` (
  `attachment_file_name` varchar(255) DEFAULT NULL,
  `attachment_file_type` varchar(255) NOT NULL,
  `attachment_url` text,
  `attachment_type` enum('contact','project','warranty') DEFAULT NULL,
  `ref_id` int(11) DEFAULT NULL,
  `_attachment_created` int(11) DEFAULT NULL,
  `_attachment_createdby` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `attachment`
--

INSERT INTO `attachment` (`attachment_file_name`, `attachment_file_type`, `attachment_url`, `attachment_type`, `ref_id`, `_attachment_created`, `_attachment_createdby`) VALUES
('BBB', '', 'URL1', 'contact', 1, NULL, NULL),
('AAA', '', 'URL2', 'contact', 1, NULL, NULL),
('CCC', 'B', 'URL3', 'project', 1, NULL, NULL),
('DDD', 'A', 'URL4', 'project', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `bank_account`
--

CREATE TABLE `bank_account` (
  `contact_id` int(11) NOT NULL,
  `bank_account_id` int(11) NOT NULL,
  `bank_account_no` varchar(255) DEFAULT NULL,
  `bank_account_bank_name` varchar(255) DEFAULT NULL,
  `bank_account_type` varchar(255) DEFAULT NULL,
  `bank_account_name` varchar(255) DEFAULT NULL,
  `bank_account_branch` varchar(255) DEFAULT NULL,
  `bank_account_description` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `bank_account`
--

INSERT INTO `bank_account` (`contact_id`, `bank_account_id`, `bank_account_no`, `bank_account_bank_name`, `bank_account_type`, `bank_account_name`, `bank_account_branch`, `bank_account_description`) VALUES
(1, 1, '123123123', 'AAA', 'BBB', 'CCC', 'DDD', 'EEE'),
(1, 2, '456456456456', 'AA', 'BB', 'CC', 'DD', 'EE');

-- --------------------------------------------------------

--
-- Table structure for table `contact`
--

CREATE TABLE `contact` (
  `contact_id` int(11) NOT NULL,
  `contact_is_customer` tinyint(1) DEFAULT NULL,
  `contact_is_vendor` tinyint(1) DEFAULT NULL,
  `contact_business_category` enum('individual','commercial','merchant') DEFAULT NULL,
  `contact_commercial_type` varchar(255) DEFAULT NULL,
  `contact_commercial_name` varchar(255) DEFAULT NULL,
  `contact_individual_prefix_name` varchar(255) DEFAULT NULL,
  `contact_individual_first_name` varchar(255) DEFAULT NULL,
  `contact_individual_last_name` varchar(255) DEFAULT NULL,
  `contact_merchant_name` varchar(255) DEFAULT NULL,
  `contact_tax_no` varchar(255) DEFAULT NULL,
  `billing_address_id` int(11) DEFAULT NULL,
  `postal_address_id` int(11) DEFAULT NULL,
  `lead_source_id` int(11) DEFAULT NULL,
  `contact_img_url` text,
  `account_receivable_id` int(11) DEFAULT NULL,
  `account_payable_id` int(11) DEFAULT NULL,
  `contact_payment_type` enum('credit','cash') DEFAULT NULL,
  `contact_is_credit_limit` tinyint(1) DEFAULT NULL,
  `contact_credit_limit_amount` int(11) DEFAULT NULL,
  `_contact_created` int(11) DEFAULT NULL,
  `_contact_createdby` int(11) DEFAULT NULL,
  `_contact_lastupdate` int(11) DEFAULT NULL,
  `_contact_lastupdateby` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `contact`
--

INSERT INTO `contact` (`contact_id`, `contact_is_customer`, `contact_is_vendor`, `contact_business_category`, `contact_commercial_type`, `contact_commercial_name`, `contact_individual_prefix_name`, `contact_individual_first_name`, `contact_individual_last_name`, `contact_merchant_name`, `contact_tax_no`, `billing_address_id`, `postal_address_id`, `lead_source_id`, `contact_img_url`, `account_receivable_id`, `account_payable_id`, `contact_payment_type`, `contact_is_credit_limit`, `contact_credit_limit_amount`, `_contact_created`, `_contact_createdby`, `_contact_lastupdate`, `_contact_lastupdateby`) VALUES
(1, 1, 1, 'individual', NULL, NULL, 'นาย', 'Sup', 'Kra', NULL, NULL, 1, 2, 1, NULL, 1, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `contact_channel`
--

CREATE TABLE `contact_channel` (
  `contact_channel_type` varchar(255) DEFAULT NULL,
  `ref_id` int(11) DEFAULT NULL,
  `contact_channel_name` varchar(255) DEFAULT NULL,
  `contact_channel_detail` varchar(255) DEFAULT NULL,
  `contact_channel_detail_2` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `contact_channel`
--

INSERT INTO `contact_channel` (`contact_channel_type`, `ref_id`, `contact_channel_name`, `contact_channel_detail`, `contact_channel_detail_2`) VALUES
('contact', 1, 'Email', 'ABCD', NULL),
('contact', 1, 'Phone', '080881238123', '123');

-- --------------------------------------------------------

--
-- Table structure for table `contact_tag`
--

CREATE TABLE `contact_tag` (
  `contact_id` int(11) DEFAULT NULL,
  `tag_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `contact_tag`
--

INSERT INTO `contact_tag` (`contact_id`, `tag_id`) VALUES
(1, 1),
(1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `employee_id` int(11) NOT NULL,
  `employee_firstname` varchar(255) DEFAULT NULL,
  `employee_lastname` varchar(255) DEFAULT NULL,
  `employee_email` varchar(255) DEFAULT NULL,
  `employee_phone` varchar(255) DEFAULT NULL,
  `employee_img_url` varchar(255) DEFAULT NULL,
  `employee_password` text,
  `employee_department` enum('Admin','Sales','Inventory','Engineer','Logistics','Account') NOT NULL,
  `employee_position` varchar(255) NOT NULL,
  `employee_status` enum('ok','delete') DEFAULT NULL,
  `_employee_created` int(11) DEFAULT NULL,
  `_employee_createdby` int(11) DEFAULT NULL,
  `_employee_lastupdate` int(11) DEFAULT NULL,
  `_employee_lastupdateby` int(11) DEFAULT NULL,
  `_employee_lastlogin` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`employee_id`, `employee_firstname`, `employee_lastname`, `employee_email`, `employee_phone`, `employee_img_url`, `employee_password`, `employee_department`, `employee_position`, `employee_status`, `_employee_created`, `_employee_createdby`, `_employee_lastupdate`, `_employee_lastupdateby`, `_employee_lastlogin`) VALUES
(1, 'ABC5', 'DEF', 'admin@admin.com', '0828959525', '', NULL, 'Admin', 'หัวหน้า', 'ok', NULL, 0, 0, 0, NULL),
(4, 'ABC', 'DEF', 'admin2@admin.com', '0828959525', '', 'admin', 'Admin', '', 'ok', 1635054936, 0, 0, 0, 1635054936),
(6, 'ABC', 'DEF', 'admin3@admin.com', '0828959525', '', 'admin', 'Admin', 'หัวหน้า', 'ok', 1635055335, 0, 0, 0, 1635055335),
(8, 'ABC', 'DEF', 'admin4@admin.com', '0828959525', '', '$2a$10$mLRN9x/bB054qZDQWLRztuD2VP86PVib5E2TNoz79WQsAT5ZjS/ju', 'Admin', 'หัวหน้า', 'ok', 1635055577, 0, 0, 0, 1635055577);

-- --------------------------------------------------------

--
-- Table structure for table `event`
--

CREATE TABLE `event` (
  `event_id` int(11) NOT NULL,
  `event_employee_id` int(11) DEFAULT NULL,
  `event_plan_start_date` int(11) DEFAULT NULL,
  `event_plan_end_date` int(11) DEFAULT NULL,
  `event_schedule_start_date` int(11) DEFAULT NULL,
  `event_schedule_end_date` int(11) DEFAULT NULL,
  `event_topic` varchar(255) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `contact_id` int(11) DEFAULT NULL,
  `person_id` int(11) DEFAULT NULL,
  `event_project_stage` enum('bid','spec','construction','other') DEFAULT NULL,
  `event_status` enum('planned','confirmed','cancelled','finished') DEFAULT NULL,
  `event_dest_location_name` varchar(255) DEFAULT NULL,
  `event_dest_latitude` varchar(255) DEFAULT NULL,
  `event_dest_longitude` varchar(255) DEFAULT NULL,
  `event_dest_google_map_link` text,
  `event_checkin_start_date` int(11) DEFAULT NULL,
  `event_checkin_start_location_name` varchar(255) DEFAULT NULL,
  `event_checkin_start_latitude` varchar(255) DEFAULT NULL,
  `event_checkin_start_longitude` varchar(255) DEFAULT NULL,
  `event_checkin_dest_date` int(11) DEFAULT NULL,
  `event_checkin_dest_location_name` varchar(255) DEFAULT NULL,
  `event_checkin_dest_latitude` varchar(255) DEFAULT NULL,
  `event_checkin_dest_longitude` varchar(255) DEFAULT NULL,
  `event_distance` int(11) DEFAULT NULL,
  `event_remark` varchar(255) DEFAULT NULL,
  `_event_created` int(11) DEFAULT NULL,
  `_event_createdby` int(11) DEFAULT NULL,
  `_event_lastupdate` int(11) DEFAULT NULL,
  `_event_lastupdateby` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `event`
--

INSERT INTO `event` (`event_id`, `event_employee_id`, `event_plan_start_date`, `event_plan_end_date`, `event_schedule_start_date`, `event_schedule_end_date`, `event_topic`, `project_id`, `contact_id`, `person_id`, `event_project_stage`, `event_status`, `event_dest_location_name`, `event_dest_latitude`, `event_dest_longitude`, `event_dest_google_map_link`, `event_checkin_start_date`, `event_checkin_start_location_name`, `event_checkin_start_latitude`, `event_checkin_start_longitude`, `event_checkin_dest_date`, `event_checkin_dest_location_name`, `event_checkin_dest_latitude`, `event_checkin_dest_longitude`, `event_distance`, `event_remark`, `_event_created`, `_event_createdby`, `_event_lastupdate`, `_event_lastupdateby`) VALUES
(1, 1, 1, 1, NULL, NULL, 'DEF', 1, 1, NULL, NULL, 'planned', 'DEF', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1635093269, NULL, NULL, NULL),
(2, 1, 1, 1, NULL, NULL, 'DEF', 1, 1, NULL, NULL, 'planned', 'DEF', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1635093325, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `lead_source`
--

CREATE TABLE `lead_source` (
  `lead_source_id` int(11) NOT NULL,
  `lead_source_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `lead_source`
--

INSERT INTO `lead_source` (`lead_source_id`, `lead_source_name`) VALUES
(1, 'Facebook'),
(2, 'Offline');

-- --------------------------------------------------------

--
-- Table structure for table `person`
--

CREATE TABLE `person` (
  `person_id` int(11) NOT NULL,
  `person_position` varchar(255) DEFAULT NULL,
  `person_first_name` varchar(255) DEFAULT NULL,
  `person_last_name` varchar(255) DEFAULT NULL,
  `person_nick_name` varchar(255) DEFAULT NULL,
  `person_birthdate` int(11) DEFAULT NULL,
  `person_img_url` text,
  `contact_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `person`
--

INSERT INTO `person` (`person_id`, `person_position`, `person_first_name`, `person_last_name`, `person_nick_name`, `person_birthdate`, `person_img_url`, `contact_id`) VALUES
(1, 'POS1', 'AAA', 'BBB', 'CCC', NULL, NULL, 1),
(2, 'POS2', 'A', 'B', 'C', NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

CREATE TABLE `project` (
  `project_id` int(11) NOT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `project_category` enum('house','condo','village','hotel','mall','university','government','factory','other') DEFAULT NULL,
  `project_stage` enum('bid','spec','construction','other') DEFAULT NULL,
  `project_deal_confidence` enum('10%','20%','30%','40%','50%','60%','80%','90%','100%') DEFAULT NULL,
  `project_deal_target_date` int(11) DEFAULT NULL,
  `project_deal_value` int(11) DEFAULT NULL,
  `project_address_id` int(11) DEFAULT NULL,
  `project_billing_business_category` enum('individual','commercial','merchant') DEFAULT NULL,
  `project_billing_commercial_type` enum('mr','mrs','ms','none') DEFAULT NULL,
  `project_billing_commercial_name` varchar(255) DEFAULT NULL,
  `project_billing_individual_prefix` enum('mr','mrs','ms','none') DEFAULT NULL,
  `project_billing_individual_first_name` varchar(255) DEFAULT NULL,
  `project_billing_individual_last_name` varchar(255) DEFAULT NULL,
  `project_billing_merchant_name` varchar(255) DEFAULT NULL,
  `project_billing_tax_no` varchar(255) DEFAULT NULL,
  `project_billing_address_id` int(11) DEFAULT NULL,
  `project_remark` varchar(255) DEFAULT NULL,
  `project_status` enum('new','ongoing','quotation','quotation_accepted','closed_success','closed_fail','finished','service','service_ended','delete') DEFAULT NULL,
  `project_installment_status` enum('inactive','active','completed') DEFAULT NULL,
  `project_shipment_status` enum('inactive','active','completed') DEFAULT NULL,
  `project_payment_status` enum('inactive','active','completed') DEFAULT NULL,
  `project_approval_status` enum('draft','submitted','rejected','approved') DEFAULT NULL,
  `project_approver` int(11) DEFAULT NULL,
  `_project_created` int(11) DEFAULT NULL,
  `_project_createdby` int(11) DEFAULT NULL,
  `_project_lastupdate` int(11) DEFAULT NULL,
  `_project_lastupdateby` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `project`
--

INSERT INTO `project` (`project_id`, `project_name`, `project_category`, `project_stage`, `project_deal_confidence`, `project_deal_target_date`, `project_deal_value`, `project_address_id`, `project_billing_business_category`, `project_billing_commercial_type`, `project_billing_commercial_name`, `project_billing_individual_prefix`, `project_billing_individual_first_name`, `project_billing_individual_last_name`, `project_billing_merchant_name`, `project_billing_tax_no`, `project_billing_address_id`, `project_remark`, `project_status`, `project_installment_status`, `project_shipment_status`, `project_payment_status`, `project_approval_status`, `project_approver`, `_project_created`, `_project_createdby`, `_project_lastupdate`, `_project_lastupdateby`) VALUES
(1, 'ABC', 'house', 'bid', '30%', NULL, 1000000, 1, 'individual', 'mr', NULL, 'mr', 'AA', 'BB', NULL, NULL, 2, NULL, 'new', 'active', 'active', 'active', 'submitted', NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_activity`
--

CREATE TABLE `project_activity` (
  `activity_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `activity_type` enum('memo','appointment','checkin','shipment','sales','document','image','status_change','contact_change') DEFAULT NULL,
  `activity_data` json DEFAULT NULL,
  `_project_activity_created` int(11) DEFAULT NULL,
  `_project_activity_createdby` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `project_activity`
--

INSERT INTO `project_activity` (`activity_id`, `project_id`, `activity_type`, `activity_data`, `_project_activity_created`, `_project_activity_createdby`) VALUES
(1, 1, 'memo', '{\"A\": \"A\"}', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_contact`
--

CREATE TABLE `project_contact` (
  `project_id` int(11) NOT NULL,
  `contact_id` int(11) NOT NULL,
  `person_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `project_contact`
--

INSERT INTO `project_contact` (`project_id`, `contact_id`, `person_id`) VALUES
(1, 1, 1),
(1, 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `project_employee`
--

CREATE TABLE `project_employee` (
  `role` varchar(255) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `project_employee`
--

INSERT INTO `project_employee` (`role`, `project_id`, `employee_id`) VALUES
('เจ้าของโปรเจค', 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `project_tag`
--

CREATE TABLE `project_tag` (
  `project_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `project_tag`
--

INSERT INTO `project_tag` (`project_id`, `tag_id`) VALUES
(1, 1),
(1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(255) DEFAULT NULL,
  `department` enum('sales','inventory','engineer','purchase','logistics','accounting','admin') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tag`
--

CREATE TABLE `tag` (
  `tag_id` int(11) NOT NULL,
  `tag_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tag`
--

INSERT INTO `tag` (`tag_id`, `tag_name`) VALUES
(1, 'TAG1'),
(2, 'TAG2');

-- --------------------------------------------------------

--
-- Table structure for table `warranty`
--

CREATE TABLE `warranty` (
  `warranty_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `warranty_name` varchar(255) DEFAULT NULL,
  `warranty_type` enum('product','installment','service') DEFAULT NULL,
  `warranty_start_date` int(11) DEFAULT NULL,
  `warranty_end_date` int(11) DEFAULT NULL,
  `warranty_status` enum('submitted','approved','expired','delete') NOT NULL,
  `warranty_approver_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `warranty`
--

INSERT INTO `warranty` (`warranty_id`, `project_id`, `warranty_name`, `warranty_type`, `warranty_start_date`, `warranty_end_date`, `warranty_status`, `warranty_approver_name`) VALUES
(1, 1, 'AAA', 'product', 1, 2, 'submitted', NULL),
(2, 1, 'BBB', 'installment', 1, 2, 'submitted', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`account_id`);

--
-- Indexes for table `address`
--
ALTER TABLE `address`
  ADD PRIMARY KEY (`address_id`);

--
-- Indexes for table `bank_account`
--
ALTER TABLE `bank_account`
  ADD PRIMARY KEY (`bank_account_id`);

--
-- Indexes for table `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`contact_id`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `employee_email` (`employee_email`);

--
-- Indexes for table `event`
--
ALTER TABLE `event`
  ADD PRIMARY KEY (`event_id`);

--
-- Indexes for table `lead_source`
--
ALTER TABLE `lead_source`
  ADD PRIMARY KEY (`lead_source_id`);

--
-- Indexes for table `person`
--
ALTER TABLE `person`
  ADD PRIMARY KEY (`person_id`);

--
-- Indexes for table `project`
--
ALTER TABLE `project`
  ADD PRIMARY KEY (`project_id`);

--
-- Indexes for table `project_activity`
--
ALTER TABLE `project_activity`
  ADD PRIMARY KEY (`activity_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `tag`
--
ALTER TABLE `tag`
  ADD PRIMARY KEY (`tag_id`);

--
-- Indexes for table `warranty`
--
ALTER TABLE `warranty`
  ADD PRIMARY KEY (`warranty_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `address`
--
ALTER TABLE `address`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `bank_account`
--
ALTER TABLE `bank_account`
  MODIFY `bank_account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `contact`
--
ALTER TABLE `contact`
  MODIFY `contact_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `event`
--
ALTER TABLE `event`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `lead_source`
--
ALTER TABLE `lead_source`
  MODIFY `lead_source_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `person`
--
ALTER TABLE `person`
  MODIFY `person_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `project_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `project_activity`
--
ALTER TABLE `project_activity`
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tag`
--
ALTER TABLE `tag`
  MODIFY `tag_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `warranty`
--
ALTER TABLE `warranty`
  MODIFY `warranty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
