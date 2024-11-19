-- phpMyAdmin SQL Dump
-- version 4.6.6deb5ubuntu0.5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jan 30, 2022 at 01:04 PM
-- Server version: 5.7.36-0ubuntu0.18.04.1
-- PHP Version: 7.2.24-0ubuntu0.18.04.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `biowood_erp_dev`
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

-- --------------------------------------------------------

--
-- Table structure for table `address`
--

CREATE TABLE `address` (
  `address_id` int(11) NOT NULL,
  `ref_id` int(11) DEFAULT NULL,
  `address_ref_type` enum('project','contact') DEFAULT NULL,
  `address_type` enum('registration','billing','other') DEFAULT NULL,
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

-- --------------------------------------------------------

--
-- Table structure for table `attachment`
--

CREATE TABLE `attachment` (
  `attachment_id` int(11) NOT NULL,
  `attachment_file_name` varchar(255) DEFAULT NULL,
  `attachment_file_type` varchar(255) NOT NULL,
  `attachment_url` text,
  `attachment_type` enum('contact','project','warranty','quotation','delivery_note','payment_receipt','payment_made') DEFAULT NULL,
  `attachment_remark` text,
  `ref_id` int(11) DEFAULT NULL,
  `_attachment_created` int(11) DEFAULT NULL,
  `_attachment_createdby` int(11) DEFAULT NULL,
  `_attachment_createdby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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

-- --------------------------------------------------------

--
-- Table structure for table `billing_note`
--

CREATE TABLE `billing_note` (
  `billing_note_id` int(11) NOT NULL,
  `billing_note_document_id` varchar(255) NOT NULL,
  `billing_note_issue_date` int(11) DEFAULT NULL,
  `billing_note_due_date` int(11) DEFAULT NULL,
  `billing_note_status` enum('draft','wait_approve','wait_payment','not_approve','over_payment_date','payment_complete','cancelled') DEFAULT NULL,
  `billing_info` json DEFAULT NULL,
  `document_list` json DEFAULT NULL,
  `billing_note_template_remark_id` int(11) DEFAULT NULL,
  `billing_note_remark` text,
  `no_of_document` int(11) DEFAULT NULL,
  `vat_exempted_amount` double DEFAULT NULL,
  `vat_0_amount` double DEFAULT NULL,
  `vat_7_amount` double DEFAULT NULL,
  `vat_amount` double DEFAULT NULL,
  `net_amount` double DEFAULT NULL,
  `withholding_tax` double NOT NULL DEFAULT '0',
  `total_amount` double NOT NULL DEFAULT '0',
  `_billing_note_created` int(11) DEFAULT NULL,
  `_billing_note_createdby` int(11) DEFAULT NULL,
  `_billing_note_createdby_employee` json DEFAULT NULL,
  `_billing_note_lastupdate` int(11) DEFAULT NULL,
  `_billing_note_lastupdateby` int(11) DEFAULT NULL,
  `_billing_note_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `combined_payment`
--

CREATE TABLE `combined_payment` (
  `combined_payment_id` int(11) NOT NULL,
  `combined_payment_document_id` varchar(255) NOT NULL,
  `external_ref_document_id` varchar(255) DEFAULT NULL,
  `combined_payment_status` enum('draft','wait_approve','wait_payment','not_approve','payment_complete','cancelled') DEFAULT NULL,
  `combined_payment_issue_date` int(11) DEFAULT NULL,
  `combined_payment_due_date` int(11) DEFAULT NULL,
  `vendor_info` json DEFAULT NULL,
  `document_list` json DEFAULT NULL,
  `combined_payment_template_remark_id` int(11) DEFAULT NULL,
  `combined_payment_remark` text,
  `no_of_document` int(11) DEFAULT NULL,
  `vat_exempted_amount` double DEFAULT NULL,
  `vat_0_amount` double DEFAULT NULL,
  `vat_7_amount` double DEFAULT NULL,
  `vat_amount` double DEFAULT NULL,
  `net_amount` double DEFAULT NULL,
  `withholding_tax` double DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `combined_payment_approveby` int(11) DEFAULT NULL,
  `combined_payment_approveby_employee` json DEFAULT NULL,
  `_combined_payment_created` int(11) DEFAULT NULL,
  `_combined_payment_createdby` int(11) DEFAULT NULL,
  `_combined_payment_createdby_employee` json DEFAULT NULL,
  `_combined_payment_lastupdate` int(11) DEFAULT NULL,
  `_combined_payment_lastupdateby` int(11) DEFAULT NULL,
  `_combined_payment_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  `contact_registration_address_id` int(11) DEFAULT NULL,
  `lead_source_name` varchar(255) DEFAULT NULL,
  `contact_img_url` text,
  `account_receivable_id` int(11) DEFAULT NULL,
  `account_payable_id` int(11) DEFAULT NULL,
  `contact_payment_type` enum('credit','cash') DEFAULT NULL,
  `contact_is_credit_limit` tinyint(1) DEFAULT NULL,
  `contact_credit_limit_amount` int(11) DEFAULT NULL,
  `contact_status` enum('ok','delete') NOT NULL DEFAULT 'ok',
  `_contact_created` int(11) DEFAULT NULL,
  `_contact_createdby` int(11) DEFAULT NULL,
  `_contact_createdby_employee` json DEFAULT NULL,
  `_contact_lastupdate` int(11) DEFAULT NULL,
  `_contact_lastupdateby` int(11) DEFAULT NULL,
  `_contact_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `contact_channel`
--

CREATE TABLE `contact_channel` (
  `contact_channel_id` int(11) NOT NULL,
  `contact_channel_type` varchar(255) DEFAULT NULL,
  `ref_id` int(11) DEFAULT NULL,
  `contact_channel_name` varchar(255) DEFAULT NULL,
  `contact_channel_detail` varchar(255) DEFAULT NULL,
  `contact_channel_detail_2` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `contact_tag`
--

CREATE TABLE `contact_tag` (
  `contact_id` int(11) DEFAULT NULL,
  `tag_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `credit_note`
--

CREATE TABLE `credit_note` (
  `credit_note_id` int(11) NOT NULL,
  `credit_note_document_id` varchar(255) NOT NULL,
  `sales_return_document_id` varchar(255) DEFAULT NULL,
  `credit_note_issue_date` int(11) DEFAULT NULL,
  `credit_note_status` enum('draft','wait_approve','not_approve','approved','closed','cancelled') DEFAULT NULL,
  `billing_info` json DEFAULT NULL,
  `credit_note_data` json DEFAULT NULL,
  `credit_note_template_remark_id` int(11) DEFAULT NULL,
  `credit_note_remark` text,
  `credit_note_approveby` int(11) DEFAULT NULL,
  `credit_note_approveby_employee` json DEFAULT NULL,
  `shipping_cost` double DEFAULT NULL,
  `additional_discount` double DEFAULT NULL,
  `vat_exempted_amount` double NOT NULL,
  `vat_0_amount` double NOT NULL,
  `vat_7_amount` double NOT NULL,
  `vat_amount` double NOT NULL,
  `net_amount` double NOT NULL,
  `withholding_tax` double NOT NULL,
  `total_amount` double DEFAULT NULL,
  `sales_invoice_document_id` varchar(255) DEFAULT NULL,
  `payment_channel_id` int(11) DEFAULT NULL,
  `check_info` json DEFAULT NULL,
  `_credit_note_created` int(11) DEFAULT NULL,
  `_credit_note_createdby` int(11) DEFAULT NULL,
  `_credit_note_createdby_employee` json DEFAULT NULL,
  `_credit_note_lastupdate` int(11) DEFAULT NULL,
  `_credit_note_lastupdateby` int(11) DEFAULT NULL,
  `_credit_note_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `debit_note`
--

CREATE TABLE `debit_note` (
  `debit_note_id` int(11) NOT NULL,
  `debit_note_document_id` varchar(255) NOT NULL,
  `purchase_return_document_id` varchar(255) DEFAULT NULL,
  `external_ref_document_id` varchar(255) DEFAULT NULL,
  `debit_note_issue_date` int(11) DEFAULT NULL,
  `debit_note_status` enum('draft','wait_approve','not_approve','approved','closed','cancelled') DEFAULT NULL,
  `vendor_info` json DEFAULT NULL,
  `debit_note_data` json DEFAULT NULL,
  `debit_note_template_remark_id` int(11) DEFAULT NULL,
  `debit_note_remark` text,
  `shipping_cost` double DEFAULT NULL,
  `additional_discount` double DEFAULT NULL,
  `vat_exempted_amount` double NOT NULL,
  `vat_0_amount` double NOT NULL,
  `vat_7_amount` double NOT NULL,
  `vat_amount` double NOT NULL,
  `net_amount` double NOT NULL,
  `withholding_tax` double NOT NULL,
  `total_amount` double DEFAULT NULL,
  `purchase_invoice_document_id` varchar(255) DEFAULT NULL,
  `payment_channel_id` int(11) DEFAULT NULL,
  `check_info` json DEFAULT NULL,
  `debit_note_approveby` int(11) DEFAULT NULL,
  `debit_note_approveby_employee` json DEFAULT NULL,
  `_debit_note_created` int(11) DEFAULT NULL,
  `_debit_note_createdby` int(11) DEFAULT NULL,
  `_debit_note_createdby_employee` json DEFAULT NULL,
  `_debit_note_lastupdate` int(11) DEFAULT NULL,
  `_debit_note_lastupdateby` int(11) DEFAULT NULL,
  `_debit_note_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `delivery_note`
--

CREATE TABLE `delivery_note` (
  `delivery_note_id` int(11) NOT NULL,
  `delivery_note_document_id` varchar(255) NOT NULL,
  `sales_order_document_id_list` json DEFAULT NULL,
  `delivery_note_issue_date` int(11) DEFAULT NULL,
  `delivery_note_delivery_date` int(11) DEFAULT NULL,
  `delivery_note_status` enum('draft','wait_delivery','not_complete','closed','cancelled','return') DEFAULT NULL,
  `billing_info` json DEFAULT NULL,
  `delivery_info` json DEFAULT NULL,
  `delivery_note_data` json DEFAULT NULL,
  `delivery_note_template_remark_id` int(11) DEFAULT NULL,
  `delivery_note_remark` text,
  `delivery_note_approveby` int(11) DEFAULT NULL,
  `delivery_note_approveby_employee` json DEFAULT NULL,
  `shipping_cost` double DEFAULT NULL,
  `additional_discount` double DEFAULT NULL,
  `vat_exempted_amount` double DEFAULT NULL,
  `vat_0_amount` double DEFAULT NULL,
  `vat_7_amount` double DEFAULT NULL,
  `vat_amount` double DEFAULT NULL,
  `net_amount` double DEFAULT NULL,
  `withholding_tax` double DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `pickup_date` int(11) DEFAULT NULL,
  `consignee_name` varchar(255) DEFAULT NULL,
  `_delivery_note_created` int(11) DEFAULT NULL,
  `_delivery_note_createdby` int(11) DEFAULT NULL,
  `_delivery_note_createdby_employee` json DEFAULT NULL,
  `_delivery_note_lastupdate` int(11) DEFAULT NULL,
  `_delivery_note_lastupdateby` int(11) DEFAULT NULL,
  `_delivery_note_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `deposit_invoice`
--

CREATE TABLE `deposit_invoice` (
  `deposit_invoice_id` int(11) NOT NULL,
  `deposit_invoice_document_id` varchar(255) DEFAULT NULL,
  `deposit_invoice_issue_date` int(11) DEFAULT NULL,
  `deposit_invoice_status` enum('draft','wait_payment','payment_complete','closed','cancelled') DEFAULT NULL,
  `billing_info` json DEFAULT NULL,
  `deposit_invoice_data` json DEFAULT NULL,
  `deposit_invoice_template_remark_id` int(11) DEFAULT NULL,
  `deposit_invoice_remark` text,
  `total_amount` int(11) DEFAULT NULL,
  `deposit_invoice_approveby` int(11) DEFAULT NULL,
  `deposit_invoice_approveby_employee` json DEFAULT NULL,
  `sales_invoice_document_id` varchar(255) DEFAULT NULL,
  `_deposit_invoice_created` int(11) DEFAULT NULL,
  `_deposit_invoice_createdby` int(11) DEFAULT NULL,
  `_deposit_invoice_createdby_employee` json DEFAULT NULL,
  `_deposit_invoice_lastupdate` int(11) DEFAULT NULL,
  `_deposit_invoice_lastupdateby` int(11) DEFAULT NULL,
  `_deposit_invoice_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  `employee_department` enum('ขาย','คลัง','ติดตั้ง/ถอดแบบ','บัญชี','จัดซื้อ','หัวหน้า','ดูแลระบบ') NOT NULL,
  `employee_position` varchar(255) NOT NULL,
  `employee_status` enum('active','inactive') DEFAULT NULL,
  `_employee_created` int(11) DEFAULT NULL,
  `_employee_createdby` int(11) DEFAULT NULL,
  `_employee_createdby_employee` json DEFAULT NULL,
  `_employee_lastupdate` int(11) DEFAULT NULL,
  `_employee_lastupdateby` int(11) DEFAULT NULL,
  `_employee_lastupdateby_employee` json DEFAULT NULL,
  `_employee_lastlogin` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  `event_project_stage` varchar(255) DEFAULT NULL,
  `event_status` enum('planned','scheduled','checkin','cancelled','finished') DEFAULT NULL,
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
  `event_distance_value` int(11) DEFAULT NULL,
  `event_distance_text` varchar(255) DEFAULT NULL,
  `event_duration_value` int(11) DEFAULT NULL,
  `event_duration_text` varchar(255) DEFAULT NULL,
  `event_remark` varchar(255) DEFAULT NULL,
  `event_cancel_date` int(11) DEFAULT NULL,
  `_event_created` int(11) DEFAULT NULL,
  `_event_createdby` int(11) DEFAULT NULL,
  `_event_createdby_employee` json DEFAULT NULL,
  `_event_lastupdate` int(11) DEFAULT NULL,
  `_event_lastupdateby` int(11) DEFAULT NULL,
  `_event_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `expenses_id` int(11) NOT NULL,
  `expenses_document_id` varchar(255) NOT NULL,
  `external_ref_document_id` varchar(255) DEFAULT NULL,
  `inventory_target` varchar(255) DEFAULT NULL,
  `expenses_issue_date` int(11) DEFAULT NULL,
  `expenses_due_date` int(11) DEFAULT NULL,
  `expenses_status` enum('draft','wait_approve','not_approve','wait_payment','payment_complete','cancelled') DEFAULT NULL,
  `vendor_info` json DEFAULT NULL,
  `expenses_data` json DEFAULT NULL,
  `expenses_remark_template_id` int(11) DEFAULT NULL,
  `expenses_remark` text,
  `additional_discount` double DEFAULT NULL,
  `vat_exempted_amount` double DEFAULT NULL,
  `vat_0_amount` double DEFAULT NULL,
  `vat_7_amount` double DEFAULT NULL,
  `vat_amount` double DEFAULT NULL,
  `net_amount` double DEFAULT NULL,
  `withholding_tax` double DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `expenses_approveby` int(11) DEFAULT NULL,
  `expenses_approveby_employee` json DEFAULT NULL,
  `_expenses_created` int(11) DEFAULT NULL,
  `_expenses_createdby` int(11) DEFAULT NULL,
  `_expenses_createdby_employee` json DEFAULT NULL,
  `_expenses_lastupdate` int(11) DEFAULT NULL,
  `_expenses_lastupdateby` int(11) DEFAULT NULL,
  `_expenses_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `payment_channel`
--

CREATE TABLE `payment_channel` (
  `payment_channel_id` int(11) NOT NULL,
  `payment_channel_type` enum('cash','bank','e_wallet','platform','receiver') DEFAULT NULL,
  `payment_channel_info` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `payment_made`
--

CREATE TABLE `payment_made` (
  `payment_made_id` int(11) NOT NULL,
  `payment_made_document_id` varchar(255) NOT NULL,
  `ref_type` enum('purchase_invoice','combined_payment','expenses') DEFAULT NULL,
  `ref_document_id` varchar(255) DEFAULT NULL,
  `external_ref_document_id` varchar(255) DEFAULT NULL,
  `payment_made_issue_date` int(11) DEFAULT NULL,
  `payment_date` int(11) DEFAULT NULL,
  `payment_made_status` enum('draft','payment_complete','cancelled') DEFAULT NULL,
  `vendor_info` json DEFAULT NULL,
  `payment_channel_id` int(11) DEFAULT NULL,
  `check_info` json DEFAULT NULL,
  `payment_made_data` json DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `payment_made_approveby` int(11) DEFAULT NULL,
  `payment_made_approveby_employee` json DEFAULT NULL,
  `_payment_made_created` int(11) DEFAULT NULL,
  `_payment_made_createdby` int(11) DEFAULT NULL,
  `_payment_made_createdby_employee` json DEFAULT NULL,
  `_payment_made_lastupdate` int(11) DEFAULT NULL,
  `_payment_made_lastupdateby` int(11) DEFAULT NULL,
  `_payment_made_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `payment_receipt`
--

CREATE TABLE `payment_receipt` (
  `payment_receipt_id` int(11) NOT NULL,
  `payment_receipt_document_id` varchar(255) DEFAULT NULL,
  `ref_type` enum('sales_invoice','deposit_invoice','billing_note') DEFAULT NULL,
  `ref_document_id` varchar(255) DEFAULT NULL,
  `payment_receipt_issue_date` int(11) DEFAULT NULL,
  `payment_date` int(11) DEFAULT NULL,
  `payment_receipt_status` enum('draft','payment_complete','cancelled') DEFAULT NULL,
  `payment_receipt_stage` enum('quotation','sales_order','invoice','payment') DEFAULT NULL,
  `billing_info` json DEFAULT NULL,
  `payment_channel_id` int(11) DEFAULT NULL,
  `check_info` json DEFAULT NULL,
  `payment_receipt_data` json DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `payment_receipt_approveby` int(11) DEFAULT NULL,
  `payment_receipt_approveby_employee` json DEFAULT NULL,
  `_payment_receipt_created` int(11) DEFAULT NULL,
  `_payment_receipt_createdby` int(11) DEFAULT NULL,
  `_payment_receipt_createdby_employee` json DEFAULT NULL,
  `_payment_receipt_lastupdate` int(11) DEFAULT NULL,
  `_payment_receipt_lastupdateby` int(11) DEFAULT NULL,
  `_payment_receipt_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  `contact_id` int(11) DEFAULT NULL,
  `person_remark` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `project`
--

CREATE TABLE `project` (
  `project_id` int(11) NOT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `project_category` varchar(255) DEFAULT NULL,
  `project_stage` varchar(255) DEFAULT NULL,
  `project_type` varchar(255) DEFAULT NULL,
  `project_type_detail` varchar(255) DEFAULT NULL,
  `project_deal_confidence` enum('10%','20%','30%','40%','50%','60%','70%','80%','90%','100%','') DEFAULT NULL,
  `project_deal_target_date` int(11) DEFAULT NULL,
  `project_deal_value` int(11) DEFAULT NULL,
  `project_address_id` int(11) DEFAULT NULL,
  `project_billing_business_category` enum('individual','commercial','merchant','') DEFAULT NULL,
  `project_billing_commercial_type` varchar(255) DEFAULT NULL,
  `project_billing_commercial_name` varchar(255) DEFAULT NULL,
  `project_billing_individual_prefix` varchar(255) DEFAULT NULL,
  `project_billing_individual_first_name` varchar(255) DEFAULT NULL,
  `project_billing_individual_last_name` varchar(255) DEFAULT NULL,
  `project_billing_merchant_name` varchar(255) DEFAULT NULL,
  `project_billing_tax_no` varchar(255) DEFAULT NULL,
  `project_billing_branch` varchar(255) DEFAULT NULL,
  `project_billing_address_id` int(11) DEFAULT NULL,
  `project_remark` varchar(255) DEFAULT NULL,
  `project_status` enum('new','ongoing','quotation','quotation_accepted','closed_success','closed_fail','finished','service','service_ended','delete') DEFAULT NULL,
  `project_installment_status` enum('inactive','active','completed','') DEFAULT NULL,
  `project_shipment_status` enum('inactive','active','completed','') DEFAULT NULL,
  `project_payment_status` enum('inactive','active','completed','') DEFAULT NULL,
  `project_approval_status` enum('draft','submitted','rejected','approved','') DEFAULT NULL,
  `project_approver` int(11) DEFAULT NULL,
  `_project_created` int(11) DEFAULT NULL,
  `_project_createdby` int(11) DEFAULT NULL,
  `_project_createdby_employee` json DEFAULT NULL,
  `_project_lastupdate` int(11) DEFAULT NULL,
  `_project_lastupdateby` int(11) DEFAULT NULL,
  `_project_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `project_activity`
--

CREATE TABLE `project_activity` (
  `activity_id` int(11) NOT NULL,
  `project_id` int(11) DEFAULT NULL,
  `activity_type` enum('memo','event','document','status_change','contact_change') DEFAULT NULL,
  `activity_data` json DEFAULT NULL,
  `_project_activity_created` int(11) DEFAULT NULL,
  `_project_activity_createdby` int(11) DEFAULT NULL,
  `_project_activity_createdby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `project_contact`
--

CREATE TABLE `project_contact` (
  `project_contact_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `contact_id` int(11) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `person_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `project_employee`
--

CREATE TABLE `project_employee` (
  `project_employee_id` int(11) NOT NULL,
  `role` varchar(255) DEFAULT NULL,
  `project_id` int(11) DEFAULT NULL,
  `employee_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `project_status_log`
--

CREATE TABLE `project_status_log` (
  `project_status_log_id` int(11) NOT NULL,
  `project_id` int(11) NOT NULL,
  `old_status` enum('new','ongoing','quotation','quotation_accepted','closed_success','closed_fail','finished','service','service_ended','delete') DEFAULT NULL,
  `new_status` enum('new','ongoing','quotation','quotation_accepted','closed_success','closed_fail','finished','service','service_ended','delete') DEFAULT NULL,
  `project_status_log_remark` text,
  `_project_status_log_created` int(11) NOT NULL,
  `_project_status_log_createdby` int(11) NOT NULL,
  `_project_status_log_createdby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `project_tag`
--

CREATE TABLE `project_tag` (
  `project_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_invoice`
--

CREATE TABLE `purchase_invoice` (
  `purchase_invoice_id` int(11) NOT NULL,
  `purchase_invoice_document_id` varchar(255) NOT NULL,
  `purchase_order_document_id` varchar(255) DEFAULT NULL,
  `external_ref_document_id` varchar(255) DEFAULT NULL,
  `purchase_invoice_issue_date` int(11) DEFAULT NULL,
  `purchase_invoice_due_date` int(11) DEFAULT NULL,
  `purchase_invoice_status` enum('draft','wait_approve','not_approve','wait_payment','payment_complete','cancelled') DEFAULT NULL,
  `vendor_info` json DEFAULT NULL,
  `purchase_invoice_data` json DEFAULT NULL,
  `purchase_invoice_template_remark_id` int(11) DEFAULT NULL,
  `purchase_invoice_remark` text,
  `additional_discount` double DEFAULT NULL,
  `vat_exempted_amount` double DEFAULT NULL,
  `vat_0_amount` double DEFAULT NULL,
  `vat_7_amount` double DEFAULT NULL,
  `vat_amount` double DEFAULT NULL,
  `net_amount` double DEFAULT NULL,
  `withholding_tax` double DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `purchase_invoice_approveby` int(11) DEFAULT NULL,
  `purchase_invoice_approveby_employee` json DEFAULT NULL,
  `_purchase_invoice_created` int(11) DEFAULT NULL,
  `_purchase_invoice_createdby` int(11) DEFAULT NULL,
  `_purchase_invoice_createdby_employee` json DEFAULT NULL,
  `_purchase_invoice_lastupdate` int(11) DEFAULT NULL,
  `_purchase_invoice_lastupdateby` int(11) DEFAULT NULL,
  `_purchase_invoice_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_order`
--

CREATE TABLE `purchase_order` (
  `purchase_order_id` int(11) NOT NULL,
  `purchase_order_document_id` varchar(255) NOT NULL,
  `purchase_request_document_id_list` json DEFAULT NULL,
  `external_ref_document_id` varchar(255) DEFAULT NULL,
  `purchase_order_status` enum('draft','wait_approve','not_approve','approved','cancelled','importing','fully_imported') DEFAULT NULL,
  `purchase_order_issue_date` int(11) DEFAULT NULL,
  `purchase_order_due_date` int(11) DEFAULT NULL,
  `purchase_order_expect_date` int(11) DEFAULT NULL,
  `inventory_target` varchar(255) DEFAULT NULL,
  `vendor_info` json DEFAULT NULL,
  `purchase_order_data` json DEFAULT NULL,
  `purchase_order_template_remark_id` int(11) DEFAULT NULL,
  `purchase_order_remark` text,
  `purchase_order_approveby` int(11) DEFAULT NULL,
  `purchase_order_approveby_employee` json DEFAULT NULL,
  `additional_discount` double DEFAULT NULL,
  `vat_exempted_amount` double DEFAULT NULL,
  `vat_0_amount` double DEFAULT NULL,
  `vat_7_amount` double DEFAULT NULL,
  `vat_amount` double DEFAULT NULL,
  `net_amount` double DEFAULT NULL,
  `withholding_tax` double DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `_purchase_order_created` int(11) DEFAULT NULL,
  `_purchase_order_createdby` int(11) DEFAULT NULL,
  `_purchase_order_createdby_employee` json DEFAULT NULL,
  `_purchase_order_lastupdate` int(11) DEFAULT NULL,
  `_purchase_order_lastupdateby` int(11) DEFAULT NULL,
  `_purchase_order_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_request`
--

CREATE TABLE `purchase_request` (
  `purchase_request_id` int(11) NOT NULL,
  `purchase_request_document_id` varchar(255) NOT NULL,
  `sales_order_document_id_list` json DEFAULT NULL,
  `purchase_request_status` enum('draft','wait_approve','not_approve','approved','ordering','fully_order','cancelled') DEFAULT NULL,
  `purchase_request_issue_date` int(11) DEFAULT NULL,
  `purchase_request_due_date` int(11) DEFAULT NULL,
  `inventory_target` varchar(255) DEFAULT NULL,
  `purchase_request_data` json DEFAULT NULL,
  `purchase_request_template_remark_id` int(11) DEFAULT NULL,
  `purchase_request_remark` text,
  `purchase_request_approveby` int(11) DEFAULT NULL,
  `purchase_request_approveby_employee` json DEFAULT NULL,
  `_purchase_request_created` int(11) DEFAULT NULL,
  `_purchase_request_createdby` int(11) DEFAULT NULL,
  `_purchase_request_createdby_employee` json DEFAULT NULL,
  `_purchase_request_lastupdate` int(11) DEFAULT NULL,
  `_purchase_request_lastupdateby` int(11) DEFAULT NULL,
  `_purchase_request_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_return`
--

CREATE TABLE `purchase_return` (
  `purchase_return_id` int(11) NOT NULL,
  `purchase_return_document_id` varchar(255) NOT NULL,
  `purchase_invoice_document_id` varchar(255) DEFAULT NULL,
  `external_ref_document_id` varchar(255) DEFAULT NULL,
  `purchase_return_issue_date` int(11) DEFAULT NULL,
  `purchase_return_delivery_date` int(11) DEFAULT NULL,
  `purchase_return_status` enum('draft','wait_approve','not_approve','approved','closed','cancelled') DEFAULT NULL,
  `vendor_info` json DEFAULT NULL,
  `purchase_return_data` json DEFAULT NULL,
  `purchase_return_template_remark_id` int(11) DEFAULT NULL,
  `purchase_return_remark` text,
  `additional_discount` double DEFAULT NULL,
  `vat_exempted_amount` double DEFAULT NULL,
  `vat_0_amount` double DEFAULT NULL,
  `vat_7_amount` double DEFAULT NULL,
  `vat_amount` double DEFAULT NULL,
  `net_amount` double DEFAULT NULL,
  `withholding_tax` double DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `purchase_return_approveby` int(11) DEFAULT NULL,
  `purchase_return_approveby_employee` json DEFAULT NULL,
  `_purchase_return_created` int(11) DEFAULT NULL,
  `_purchase_return_createdby` int(11) DEFAULT NULL,
  `_purchase_return_createdby_employee` json DEFAULT NULL,
  `_purchase_return_lastupdate` int(11) DEFAULT NULL,
  `_purchase_return_lastupdateby` int(11) DEFAULT NULL,
  `_purchase_return_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `quotation`
--

CREATE TABLE `quotation` (
  `quotation_id` int(11) NOT NULL,
  `quotation_document_id` varchar(255) NOT NULL,
  `quotation_issue_date` int(11) DEFAULT NULL,
  `quotation_valid_until_date` int(11) DEFAULT NULL,
  `quotation_status` enum('draft','wait_approve','not_approve','wait_accept','finished','accepted','closed','cancelled') DEFAULT NULL,
  `quotation_stage` enum('quotation','sales_order','invoice','payment_complete','receipt') DEFAULT NULL,
  `billing_info` json DEFAULT NULL,
  `quotation_data` json DEFAULT NULL,
  `sale_list` json DEFAULT NULL,
  `quotation_approveby` int(11) DEFAULT NULL,
  `quotation_approveby_employee` json DEFAULT NULL,
  `quotation_accept_date` int(11) DEFAULT NULL,
  `quotation_template_remark_id` int(11) DEFAULT NULL,
  `quotation_remark` text,
  `shipping_cost` double DEFAULT NULL,
  `additional_discount` double DEFAULT NULL,
  `vat_exempted_amount` double DEFAULT NULL,
  `vat_0_amount` double DEFAULT NULL,
  `vat_7_amount` double DEFAULT NULL,
  `vat_amount` double DEFAULT NULL,
  `net_amount` double DEFAULT NULL,
  `withholding_tax` double DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `_quotation_created` int(11) DEFAULT NULL,
  `_quotation_createdby` int(11) DEFAULT NULL,
  `_quotation_createdby_employee` json DEFAULT NULL,
  `_quotation_lastupdate` int(11) DEFAULT NULL,
  `_quotation_lastupdateby` int(11) DEFAULT NULL,
  `_quotation_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `remark_template`
--

CREATE TABLE `remark_template` (
  `remark_template_id` int(11) NOT NULL,
  `remark_template_name` varchar(255) DEFAULT NULL,
  `template` text,
  `_remark_template_created` int(11) DEFAULT NULL,
  `_remark_template_createdby` int(11) DEFAULT NULL,
  `_remark_template_createdby_employee` json DEFAULT NULL,
  `_remark_template_lastupdate` int(11) DEFAULT NULL,
  `_remark_template_lastupdateby` int(11) DEFAULT NULL,
  `_remark_template_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
-- Table structure for table `running_document_id`
--

CREATE TABLE `running_document_id` (
  `id` int(11) NOT NULL,
  `document_type` enum('quotation','sales_order','sales_invoice','deposit_invoice','payment','receipt','billing_note','delivery_note','sales_return','credit_note','purchase_request','purchase_order','purchase_invoice','payment_made','combined_payment','purchase_return','debit_note','expenses') DEFAULT NULL,
  `last_document_id` varchar(255) DEFAULT NULL,
  `document_year` varchar(255) DEFAULT NULL,
  `document_month` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `sales_invoice`
--

CREATE TABLE `sales_invoice` (
  `sales_invoice_id` int(11) NOT NULL,
  `sales_invoice_document_id` varchar(255) NOT NULL,
  `sales_order_document_id` varchar(255) DEFAULT NULL,
  `sales_invoice_status` enum('draft','wait_approve','wait_payment','not_approve','payment_complete','cancelled') DEFAULT NULL,
  `sales_invoice_stage` enum('quotation','sales_order','invoice','payment') DEFAULT NULL,
  `sales_invoice_issue_date` int(11) DEFAULT NULL,
  `sales_invoice_due_date` int(11) DEFAULT NULL,
  `billing_info` json DEFAULT NULL,
  `sales_invoice_data` json DEFAULT NULL,
  `sale_list` json DEFAULT NULL,
  `sales_invoice_approveby` int(11) DEFAULT NULL,
  `sales_invoice_approveby_employee` json DEFAULT NULL,
  `sales_invoice_template_remark_id` int(11) DEFAULT NULL,
  `sales_invoice_remark` text,
  `shipping_cost` double DEFAULT NULL,
  `additional_discount` double DEFAULT NULL,
  `vat_exempted_amount` double DEFAULT NULL,
  `vat_0_amount` double DEFAULT NULL,
  `vat_7_amount` double DEFAULT NULL,
  `vat_amount` double DEFAULT NULL,
  `net_amount` double DEFAULT NULL,
  `withholding_tax` double DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `_sales_invoice_created` int(11) DEFAULT NULL,
  `_sales_invoice_createdby` int(11) DEFAULT NULL,
  `_sales_invoice_createdby_employee` json DEFAULT NULL,
  `_sales_invoice_lastupdate` int(11) DEFAULT NULL,
  `_sales_invoice_lastupdateby` int(11) DEFAULT NULL,
  `_sales_invoice_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `sales_order`
--

CREATE TABLE `sales_order` (
  `sales_order_id` int(11) NOT NULL,
  `sales_order_document_id` varchar(255) NOT NULL,
  `quotation_document_id` varchar(255) DEFAULT NULL,
  `sales_order_issue_date` int(11) DEFAULT NULL,
  `sales_order_due_date` int(11) DEFAULT NULL,
  `sales_order_expect_date` int(11) DEFAULT NULL,
  `sales_order_status` enum('draft','wait_approve','not_approve','approved','finished','accepted','closed','cancelled') DEFAULT NULL,
  `sales_order_stage` enum('quotation','sales_order','invoice','payment') DEFAULT NULL,
  `billing_info` json DEFAULT NULL,
  `sales_order_data` json DEFAULT NULL,
  `sale_list` json DEFAULT NULL,
  `sales_order_approveby` int(11) DEFAULT NULL,
  `sales_order_approveby_employee` json DEFAULT NULL,
  `sales_order_template_remark_id` int(11) DEFAULT NULL,
  `sales_order_remark` text,
  `shipping_cost` double DEFAULT NULL,
  `additional_discount` double DEFAULT NULL,
  `vat_exempted_amount` double DEFAULT NULL,
  `vat_0_amount` double DEFAULT NULL,
  `vat_7_amount` double DEFAULT NULL,
  `vat_amount` double DEFAULT NULL,
  `net_amount` double DEFAULT NULL,
  `withholding_tax` double DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `_sales_order_created` int(11) DEFAULT NULL,
  `_sales_order_createdby` int(11) DEFAULT NULL,
  `_sales_order_createdby_employee` json DEFAULT NULL,
  `_sales_order_lastupdate` int(11) DEFAULT NULL,
  `_sales_order_lastupdateby` int(11) DEFAULT NULL,
  `_sales_order_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `sales_return`
--

CREATE TABLE `sales_return` (
  `sales_return_id` int(11) NOT NULL,
  `sales_return_document_id` varchar(255) DEFAULT NULL,
  `delivery_note_document_id` varchar(255) DEFAULT NULL,
  `sales_return_issue_date` int(11) DEFAULT NULL,
  `sales_return_delivery_date` int(11) DEFAULT NULL,
  `sales_return_status` enum('draft','wait_approve','not_approve','approved','closed','cancelled') DEFAULT NULL,
  `billing_info` json DEFAULT NULL,
  `sales_return_data` json DEFAULT NULL,
  `sales_return_template_remark_id` int(11) DEFAULT NULL,
  `sales_return_remark` text,
  `sales_return_approveby` int(11) DEFAULT NULL,
  `sales_return_approveby_employee` json DEFAULT NULL,
  `shipping_cost` double DEFAULT NULL,
  `additional_discount` double DEFAULT NULL,
  `vat_exempted_amount` double DEFAULT NULL,
  `vat_0_amount` double DEFAULT NULL,
  `vat_7_amount` double DEFAULT NULL,
  `vat_amount` double DEFAULT NULL,
  `net_amount` double DEFAULT NULL,
  `withholding_tax` double DEFAULT NULL,
  `total_amount` double DEFAULT NULL,
  `_sales_return_created` int(11) DEFAULT NULL,
  `_sales_return_createdby` int(11) DEFAULT NULL,
  `_sales_return_createdby_employee` json DEFAULT NULL,
  `_sales_return_lastupdate` int(11) DEFAULT NULL,
  `_sales_return_lastupdateby` int(11) DEFAULT NULL,
  `_sales_return_lastupdateby_employee` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tag`
--

CREATE TABLE `tag` (
  `tag_id` int(11) NOT NULL,
  `tag_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
-- Indexes for table `attachment`
--
ALTER TABLE `attachment`
  ADD PRIMARY KEY (`attachment_id`);

--
-- Indexes for table `bank_account`
--
ALTER TABLE `bank_account`
  ADD PRIMARY KEY (`bank_account_id`);

--
-- Indexes for table `billing_note`
--
ALTER TABLE `billing_note`
  ADD PRIMARY KEY (`billing_note_id`),
  ADD UNIQUE KEY `billing_note_document_id` (`billing_note_document_id`);

--
-- Indexes for table `combined_payment`
--
ALTER TABLE `combined_payment`
  ADD PRIMARY KEY (`combined_payment_id`),
  ADD UNIQUE KEY `combined_payment_document_id` (`combined_payment_document_id`);

--
-- Indexes for table `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`contact_id`);

--
-- Indexes for table `contact_channel`
--
ALTER TABLE `contact_channel`
  ADD PRIMARY KEY (`contact_channel_id`);

--
-- Indexes for table `credit_note`
--
ALTER TABLE `credit_note`
  ADD PRIMARY KEY (`credit_note_id`),
  ADD UNIQUE KEY `credit_note_document_id` (`credit_note_document_id`);

--
-- Indexes for table `debit_note`
--
ALTER TABLE `debit_note`
  ADD PRIMARY KEY (`debit_note_id`),
  ADD UNIQUE KEY `debit_note_document_id` (`debit_note_document_id`);

--
-- Indexes for table `delivery_note`
--
ALTER TABLE `delivery_note`
  ADD PRIMARY KEY (`delivery_note_id`),
  ADD UNIQUE KEY `delivery_note_document_id` (`delivery_note_document_id`);

--
-- Indexes for table `deposit_invoice`
--
ALTER TABLE `deposit_invoice`
  ADD PRIMARY KEY (`deposit_invoice_id`);

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
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`expenses_id`),
  ADD UNIQUE KEY `expenses_document_id` (`expenses_document_id`);

--
-- Indexes for table `payment_channel`
--
ALTER TABLE `payment_channel`
  ADD PRIMARY KEY (`payment_channel_id`);

--
-- Indexes for table `payment_made`
--
ALTER TABLE `payment_made`
  ADD PRIMARY KEY (`payment_made_id`),
  ADD UNIQUE KEY `payment_made_document_id` (`payment_made_document_id`);

--
-- Indexes for table `payment_receipt`
--
ALTER TABLE `payment_receipt`
  ADD PRIMARY KEY (`payment_receipt_id`);

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
-- Indexes for table `project_contact`
--
ALTER TABLE `project_contact`
  ADD PRIMARY KEY (`project_contact_id`);

--
-- Indexes for table `project_employee`
--
ALTER TABLE `project_employee`
  ADD PRIMARY KEY (`project_employee_id`);

--
-- Indexes for table `project_status_log`
--
ALTER TABLE `project_status_log`
  ADD PRIMARY KEY (`project_status_log_id`);

--
-- Indexes for table `purchase_invoice`
--
ALTER TABLE `purchase_invoice`
  ADD PRIMARY KEY (`purchase_invoice_id`),
  ADD UNIQUE KEY `purchase_invoice_document_id` (`purchase_invoice_document_id`);

--
-- Indexes for table `purchase_order`
--
ALTER TABLE `purchase_order`
  ADD PRIMARY KEY (`purchase_order_id`),
  ADD UNIQUE KEY `purchase_order_document_id` (`purchase_order_document_id`);

--
-- Indexes for table `purchase_request`
--
ALTER TABLE `purchase_request`
  ADD PRIMARY KEY (`purchase_request_id`),
  ADD UNIQUE KEY `purchase_request_document_id` (`purchase_request_document_id`);

--
-- Indexes for table `purchase_return`
--
ALTER TABLE `purchase_return`
  ADD PRIMARY KEY (`purchase_return_id`),
  ADD UNIQUE KEY `purchase_return_document_id` (`purchase_return_document_id`);

--
-- Indexes for table `quotation`
--
ALTER TABLE `quotation`
  ADD PRIMARY KEY (`quotation_id`),
  ADD UNIQUE KEY `quotation_document_id` (`quotation_document_id`);

--
-- Indexes for table `remark_template`
--
ALTER TABLE `remark_template`
  ADD PRIMARY KEY (`remark_template_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `running_document_id`
--
ALTER TABLE `running_document_id`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sales_invoice`
--
ALTER TABLE `sales_invoice`
  ADD PRIMARY KEY (`sales_invoice_id`),
  ADD UNIQUE KEY `sales_invoice_document_id` (`sales_invoice_document_id`);

--
-- Indexes for table `sales_order`
--
ALTER TABLE `sales_order`
  ADD PRIMARY KEY (`sales_order_id`),
  ADD UNIQUE KEY `sales_order_document_id` (`sales_order_document_id`);

--
-- Indexes for table `sales_return`
--
ALTER TABLE `sales_return`
  ADD PRIMARY KEY (`sales_return_id`);

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
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `address`
--
ALTER TABLE `address`
  MODIFY `address_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `attachment`
--
ALTER TABLE `attachment`
  MODIFY `attachment_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `bank_account`
--
ALTER TABLE `bank_account`
  MODIFY `bank_account_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `billing_note`
--
ALTER TABLE `billing_note`
  MODIFY `billing_note_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `combined_payment`
--
ALTER TABLE `combined_payment`
  MODIFY `combined_payment_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `contact`
--
ALTER TABLE `contact`
  MODIFY `contact_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `contact_channel`
--
ALTER TABLE `contact_channel`
  MODIFY `contact_channel_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `credit_note`
--
ALTER TABLE `credit_note`
  MODIFY `credit_note_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `debit_note`
--
ALTER TABLE `debit_note`
  MODIFY `debit_note_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `delivery_note`
--
ALTER TABLE `delivery_note`
  MODIFY `delivery_note_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `deposit_invoice`
--
ALTER TABLE `deposit_invoice`
  MODIFY `deposit_invoice_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `event`
--
ALTER TABLE `event`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `expenses_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `payment_channel`
--
ALTER TABLE `payment_channel`
  MODIFY `payment_channel_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `payment_made`
--
ALTER TABLE `payment_made`
  MODIFY `payment_made_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `payment_receipt`
--
ALTER TABLE `payment_receipt`
  MODIFY `payment_receipt_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `person`
--
ALTER TABLE `person`
  MODIFY `person_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `project`
--
ALTER TABLE `project`
  MODIFY `project_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `project_activity`
--
ALTER TABLE `project_activity`
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `project_contact`
--
ALTER TABLE `project_contact`
  MODIFY `project_contact_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `project_employee`
--
ALTER TABLE `project_employee`
  MODIFY `project_employee_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `project_status_log`
--
ALTER TABLE `project_status_log`
  MODIFY `project_status_log_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `purchase_invoice`
--
ALTER TABLE `purchase_invoice`
  MODIFY `purchase_invoice_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `purchase_order`
--
ALTER TABLE `purchase_order`
  MODIFY `purchase_order_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `purchase_request`
--
ALTER TABLE `purchase_request`
  MODIFY `purchase_request_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `purchase_return`
--
ALTER TABLE `purchase_return`
  MODIFY `purchase_return_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `quotation`
--
ALTER TABLE `quotation`
  MODIFY `quotation_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `remark_template`
--
ALTER TABLE `remark_template`
  MODIFY `remark_template_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `running_document_id`
--
ALTER TABLE `running_document_id`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `sales_invoice`
--
ALTER TABLE `sales_invoice`
  MODIFY `sales_invoice_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `sales_order`
--
ALTER TABLE `sales_order`
  MODIFY `sales_order_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `sales_return`
--
ALTER TABLE `sales_return`
  MODIFY `sales_return_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `tag`
--
ALTER TABLE `tag`
  MODIFY `tag_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `warranty`
--
ALTER TABLE `warranty`
  MODIFY `warranty_id` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
