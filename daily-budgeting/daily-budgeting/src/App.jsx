import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts";

/* ---------------------------------------------------------
   DATA
--------------------------------------------------------- */

const CATEGORY_GROUPS = {
  "HOME": ["Mortgage", "Insurance", "Repairs", "Services", "Utilities"],
  "DAILY LIVING": ["Groceries", "Transfers", "Laundry", "Food", "Treat food", "Purchases", "Dining out"],
  "TRANSPORTATION": ["Gas/fuel", "Insurance", "Repairs", "Car wash/detailing services", "Parking", "Public transportation"],
  "ENTERTAINMENT": ["Cable TV", "Video/DVD rentals", "Movies/plays", "Concerts/clubs"],
  "HEALTH": ["Health club dues", "Insurance", "Prescriptions", "Over-the-counter drugs", "Co-payments/out-of-pocket", "Veterinarians/pet medicines", "Life insurance"],
  "VACATIONS": ["Fare", "Accommodations", "Souvenirs", "Pet boarding", "Rental car"],
  "RECREATION": ["Gym fees", "Sports equipment", "Team dues", "Toys/child gear"],
  "DUES/SUBSCRIPTION": ["Magazines", "Newspapers", "Internet connection", "Public radio", "Public television", "Religious organizations", "Charity"],
  "PERSONAL": ["Clothing", "Gifts", "Salon/barber", "Books", "Music (CDs, etc.)"],
  "FINANCIAL OBLIGATIONS": ["Installments", "Income tax (additional)", "Other obligations"],
  "CREDIT CARD": ["Subscriptions", "Dining out", "Clothing", "Internet", "Installments", "Other"],
  "INVESTMENTS": ["Stocks", "Forex", "Mutual Funds", "RDN Top-up"],
};

const INVESTMENT_CATEGORIES = CATEGORY_GROUPS["INVESTMENTS"];

const INCOME_CATEGORIES = ["Wages", "Cash leftovers", "Bank cash leftovers", "Transfers", "Incoming Transfers", "Dividends", "Investment Withdrawal"];

const SOURCES = ["BCA Account", "Credit Card BCA", "SPayLater", "YUP", "Cash", "Other"];

const GROUP_ORDER = Object.keys(CATEGORY_GROUPS);

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const SEED_TRANSACTIONS = [{"date":"2026-01-04","name":"Car Gas","amount":200000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-0"},{"date":"2026-01-05","name":"Transfer Semarang Fara","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-1"},{"date":"2026-01-05","name":"Makan siang Padang Murah","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-2"},{"date":"2026-01-05","name":"Netflix payment","amount":120000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-3"},{"date":"2026-01-05","name":"CC Tax","amount":6351,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-4"},{"date":"2026-01-06","name":"Transfer Billiard Khafid","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-5"},{"date":"2026-01-06","name":"Gojek Pagi","amount":8000,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-6"},{"date":"2026-01-06","name":"Transfer Lesehan Fara","amount":49750,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-7"},{"date":"2026-01-06","name":"Transfer Siomay Fara","amount":15000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-8"},{"date":"2026-01-06","name":"Duolingo Subs","amount":480000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-9"},{"date":"2026-01-06","name":"Bakmi Rebus","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-10"},{"date":"2026-01-07","name":"Mobile Internet","amount":45000,"type":"expense","group":"CREDIT CARD","category":"Internet","source":"Credit Card BCA","id":"seed-11"},{"date":"2026-01-08","name":"Padang Murah","amount":14000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-12"},{"date":"2026-01-08","name":"TF Pecel Fara","amount":23000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-13"},{"date":"2026-01-08","name":"Bus Jakarta","amount":50000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-14"},{"date":"2026-01-08","name":"Parking","amount":2000,"type":"expense","group":"TRANSPORTATION","category":"Parking","source":"BCA Account","id":"seed-15"},{"date":"2026-01-08","name":"TF Padang Mas Le","amount":15000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-16"},{"date":"2026-01-08","name":"Bensin motor","amount":20000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-17"},{"date":"2026-01-08","name":"Burjo Motekar","amount":17000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-18"},{"date":"2026-01-10","name":"Shopeefood","amount":53180,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-19"},{"date":"2026-01-10","name":"Membership gym","amount":255000,"type":"expense","group":"RECREATION","category":"Gym fees","source":"BCA Account","id":"seed-20"},{"date":"2026-01-10","name":"Barber","amount":45000,"type":"expense","group":"PERSONAL","category":"Salon/barber","source":"BCA Account","id":"seed-21"},{"date":"2026-01-10","name":"Perfume","amount":160000,"type":"expense","group":"DAILY LIVING","category":"Purchases","source":"BCA Account","id":"seed-22"},{"date":"2026-01-11","name":"Shopeefood","amount":65525,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-23"},{"date":"2026-01-12","name":"Rocket Chicken","amount":14000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-24"},{"date":"2026-01-12","name":"Arum Saji","amount":41500,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-25"},{"date":"2026-01-13","name":"Loske","amount":23000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-26"},{"date":"2026-01-13","name":"Burjo Motekar","amount":19000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-27"},{"date":"2026-01-14","name":"Nasi telur","amount":27700,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-28"},{"date":"2026-01-14","name":"Sugoi Ramen","amount":35000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-29"},{"date":"2026-01-14","name":"Bensin motor","amount":20000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-30"},{"date":"2026-01-15","name":"Padang","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-31"},{"date":"2026-01-15","name":"Motekar","amount":17000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-32"},{"date":"2026-01-16","name":"7 Speed","amount":171800,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-33"},{"date":"2026-01-16","name":"Tahu Gejrot","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-34"},{"date":"2026-01-16","name":"Makan","amount":29000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-35"},{"date":"2026-01-16","name":"Makan","amount":25000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-36"},{"date":"2026-01-16","name":"Gojek","amount":81500,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-37"},{"date":"2026-01-18","name":"Makan","amount":24800,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-38"},{"date":"2026-01-18","name":"Makan siang Padang Murah","amount":19000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-39"},{"date":"2026-01-18","name":"Withdraw cc","amount":1030000,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-40"},{"date":"2026-01-18","name":"Tiket orkestra","amount":520000,"type":"expense","group":"ENTERTAINMENT","category":"Concerts/clubs","source":"BCA Account","id":"seed-41"},{"date":"2026-01-18","name":"Warmindo","amount":21000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-42"},{"date":"2026-01-19","name":"Waroeng Steak","amount":76818,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-43"},{"date":"2026-01-20","name":"TF Fara","amount":39700,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-44"},{"date":"2026-01-20","name":"TF Khafid Obihiro","amount":134780,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-45"},{"date":"2026-01-20","name":"Olive","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-46"},{"date":"2026-01-20","name":"Kebab","amount":26000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-47"},{"date":"2026-01-21","name":"Laundry","amount":24720,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-48"},{"date":"2026-01-21","name":"Shopeefood","amount":38600,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-49"},{"date":"2026-01-22","name":"Padang Murah","amount":11000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-50"},{"date":"2026-01-22","name":"Shopeefood","amount":31000,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-51"},{"date":"2026-01-23","name":"Hara Chicken","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-52"},{"date":"2026-01-23","name":"Shopeefood","amount":51550,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-53"},{"date":"2026-01-24","name":"TF Pantai","amount":157500,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-54"},{"date":"2026-01-25","name":"Shopeefood","amount":63800,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-55"},{"date":"2026-01-26","name":"Makan","amount":25500,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-56"},{"date":"2026-01-26","name":"Makan","amount":35000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-57"},{"date":"2026-01-26","name":"KFC","amount":50000,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-58"},{"date":"2026-01-27","name":"SPF","amount":42200,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-59"},{"date":"2026-01-27","name":"Makan","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-60"},{"date":"2026-01-28","name":"SPF","amount":45300,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-61"},{"date":"2026-01-30","name":"Makan","amount":12000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-62"},{"date":"2026-01-30","name":"Fee admin","amount":7500,"type":"expense","group":"FINANCIAL OBLIGATIONS","category":"Income tax (additional)","source":"BCA Account","id":"seed-63"},{"date":"2026-01-30","name":"Data","amount":55000,"type":"expense","group":"CREDIT CARD","category":"Internet","source":"Credit Card BCA","id":"seed-64"},{"date":"2026-01-30","name":"SPF","amount":38000,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-65"},{"date":"2026-01-30","name":"Bensin motor","amount":40000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-66"},{"date":"2026-01-30","name":"Shopeefood Tgl 3","amount":29700,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-67"},{"date":"2026-01-30","name":"Error margin","amount":91330,"type":"expense","group":"FINANCIAL OBLIGATIONS","category":"Other obligations","source":"BCA Account","id":"seed-68"},{"date":"2026-01-31","name":"Indomaret","amount":11000,"type":"expense","group":"DAILY LIVING","category":"Groceries","source":"BCA Account","id":"seed-69"},{"date":"2026-01-31","name":"Sarapan Deles","amount":15000,"type":"expense","group":"DAILY LIVING","category":"Dining out","source":"BCA Account","id":"seed-70"},{"date":"2026-01-31","name":"SeiIndonesia","amount":52338,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-71"},{"date":"2026-01-31","name":"Indomaret","amount":5000,"type":"expense","group":"DAILY LIVING","category":"Groceries","source":"BCA Account","id":"seed-72"},{"date":"2026-01-31","name":"TF Hayu","amount":15000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-73"},{"date":"2026-01-31","name":"ICloud","amount":15000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-74"},{"date":"2026-01-31","name":"Margin","amount":13250,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-75"},{"date":"2026-01-31","name":"CC Tax","amount":125000,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-76"},{"date":"2026-02-01","name":"Mobil Februari","amount":1402500,"type":"expense","group":"FINANCIAL OBLIGATIONS","category":"Installments","source":"BCA Account","id":"seed-77"},{"date":"2026-02-01","name":"Kos Februari","amount":622500,"type":"expense","group":"HOME","category":"Mortgage","source":"BCA Account","id":"seed-78"},{"date":"2026-02-01","name":"Pigura Irwan","amount":5000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-79"},{"date":"2026-02-01","name":"Hara Chicken","amount":27000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-80"},{"date":"2026-02-01","name":"Trevoil Barbershop","amount":45000,"type":"expense","group":"PERSONAL","category":"Salon/barber","source":"BCA Account","id":"seed-81"},{"date":"2026-02-01","name":"Burjo Motekar","amount":17000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-82"},{"date":"2026-02-01","name":"Matcha omore","amount":45000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-83"},{"date":"2026-02-02","name":"Servis Motor","amount":52000,"type":"expense","group":"TRANSPORTATION","category":"Repairs","source":"BCA Account","id":"seed-84"},{"date":"2026-02-02","name":"Kartu IM3","amount":35000,"type":"expense","group":"DAILY LIVING","category":"Purchases","source":"BCA Account","id":"seed-85"},{"date":"2026-02-02","name":"INDF Stock","amount":681020,"type":"expense","group":"INVESTMENTS","category":"RDN Top-up","source":"BCA Account","id":"seed-86"},{"date":"2026-02-02","name":"Parkir","amount":2000,"type":"expense","group":"TRANSPORTATION","category":"Parking","source":"BCA Account","id":"seed-87"},{"date":"2026-02-02","name":"Bensin motor","amount":25000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-88"},{"date":"2026-02-02","name":"Bakso","amount":21000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-89"},{"date":"2026-02-03","name":"Lotek","amount":14000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-90"},{"date":"2026-02-03","name":"Bakso Tetelan","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-91"},{"date":"2026-02-03","name":"Premi BCA Credit Life","amount":10396,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-92"},{"date":"2026-02-03","name":"Unique Chicken","amount":38325,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-93"},{"date":"2026-02-04","name":"Nasi Lemak ","amount":13000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-94"},{"date":"2026-02-04","name":"5CM/Sec","amount":45000,"type":"expense","group":"ENTERTAINMENT","category":"Movies/plays","source":"BCA Account","id":"seed-95"},{"date":"2026-02-04","name":"Executive Tee","amount":151900,"type":"expense","group":"CREDIT CARD","category":"Clothing","source":"Credit Card BCA","id":"seed-96"},{"date":"2026-02-04","name":"Uniqlo Pants","amount":399000,"type":"expense","group":"CREDIT CARD","category":"Clothing","source":"Credit Card BCA","id":"seed-97"},{"date":"2026-02-04","name":"KFC","amount":50000,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-98"},{"date":"2026-02-04","name":"Netflix Subs","amount":120000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-99"},{"date":"2026-02-05","name":"Rocket Chicken","amount":14000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-100"},{"date":"2026-02-05","name":"Parkir","amount":4000,"type":"expense","group":"TRANSPORTATION","category":"Parking","source":"BCA Account","id":"seed-101"},{"date":"2026-02-05","name":"Nasi omlet","amount":23500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-102"},{"date":"2026-02-06","name":"Olive","amount":15000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-103"},{"date":"2026-02-06","name":"Sate padang","amount":26500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-104"},{"date":"2026-02-06","name":"Celana + masker","amount":157899,"type":"expense","group":"CREDIT CARD","category":"Clothing","source":"Credit Card BCA","id":"seed-105"},{"date":"2026-02-07","name":"Makan sabtu","amount":34285,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-106"},{"date":"2026-02-07","name":"Konek cc to tiktok","amount":10000,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-107"},{"date":"2026-02-07","name":"Ipad Holder","amount":44400,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-108"},{"date":"2026-02-07","name":"Kopi","amount":25000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-109"},{"date":"2026-02-07","name":"Steak","amount":33500,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-110"},{"date":"2026-02-07","name":"Withdraw tax","amount":7500,"type":"expense","group":"FINANCIAL OBLIGATIONS","category":"Other obligations","source":"BCA Account","id":"seed-111"},{"date":"2026-02-09","name":"Loske","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-112"},{"date":"2026-02-09","name":"Sop Ayam","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-113"},{"date":"2026-02-10","name":"MBR","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-114"},{"date":"2026-02-10","name":"Ngado Step","amount":50000,"type":"expense","group":"PERSONAL","category":"Gifts","source":"BCA Account","id":"seed-115"},{"date":"2026-02-10","name":"Bensin","amount":100000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-116"},{"date":"2026-02-10","name":"Gym membership","amount":215000,"type":"expense","group":"RECREATION","category":"Gym fees","source":"BCA Account","id":"seed-117"},{"date":"2026-02-10","name":"Bakso cak irwan","amount":17000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-118"},{"date":"2026-02-10","name":"Laundry","amount":30000,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-119"},{"date":"2026-02-11","name":"Parkir","amount":2000,"type":"expense","group":"TRANSPORTATION","category":"Parking","source":"BCA Account","id":"seed-120"},{"date":"2026-02-11","name":"Ayam Sadeyan","amount":36000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-121"},{"date":"2026-02-12","name":"Holy Chick","amount":74750,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-122"},{"date":"2026-02-13","name":"Arum Saji","amount":37720,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-123"},{"date":"2026-02-13","name":"Unique Chicken","amount":57725,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-124"},{"date":"2026-02-14","name":"Bensin mobil","amount":111700,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-125"},{"date":"2026-02-14","name":"Parkir","amount":5000,"type":"expense","group":"TRANSPORTATION","category":"Parking","source":"BCA Account","id":"seed-126"},{"date":"2026-02-16","name":"Makan","amount":40280,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-127"},{"date":"2026-02-17","name":"Bangor","amount":66700,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-128"},{"date":"2026-02-17","name":"Shopeefood","amount":29838,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-129"},{"date":"2026-02-17","name":"SeIndonesia","amount":28500,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-130"},{"date":"2026-02-17","name":"Chatime","amount":28000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-131"},{"date":"2026-02-17","name":"Chemki","amount":40000,"type":"expense","group":"DAILY LIVING","category":"Purchases","source":"BCA Account","id":"seed-132"},{"date":"2026-02-18","name":"Makan sabtu","amount":43880,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-133"},{"date":"2026-02-19","name":"Sahur","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-134"},{"date":"2026-02-19","name":"Jatinangor","amount":26000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-135"},{"date":"2026-02-20","name":"Sahur padang","amount":16500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-136"},{"date":"2026-02-20","name":"Bensin","amount":20000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-137"},{"date":"2026-02-21","name":"Makan","amount":46500,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-138"},{"date":"2026-02-21","name":"Cat mobil","amount":202500,"type":"expense","group":"TRANSPORTATION","category":"Repairs","source":"BCA Account","id":"seed-139"},{"date":"2026-02-21","name":"Makan","amount":40430,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-140"},{"date":"2026-02-22","name":"Makan + Sahur","amount":42450,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-141"},{"date":"2026-02-23","name":"Jatinangor","amount":45000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-142"},{"date":"2026-02-23","name":"Sahur","amount":17000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-143"},{"date":"2026-02-23","name":"TF Bukber","amount":70000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-144"},{"date":"2026-02-24","name":"Casan","amount":48000,"type":"expense","group":"DAILY LIVING","category":"Purchases","source":"BCA Account","id":"seed-145"},{"date":"2026-02-24","name":"Gyoza","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-146"},{"date":"2026-02-24","name":"Karaage","amount":13000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-147"},{"date":"2026-02-25","name":"Internet","amount":75000,"type":"expense","group":"CREDIT CARD","category":"Internet","source":"Credit Card BCA","id":"seed-148"},{"date":"2026-02-25","name":"Peak","amount":43399,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-149"},{"date":"2026-02-26","name":"Kaizen","amount":180000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-150"},{"date":"2026-02-27","name":"Gembus pak gepuk","amount":23000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-151"},{"date":"2026-02-27","name":"Hara chicken","amount":33000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-152"},{"date":"2026-02-27","name":"Sahur","amount":16285,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-153"},{"date":"2026-02-27","name":"Copenhagen","amount":114000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-154"},{"date":"2026-02-27","name":"Bensin mobil","amount":23000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-155"},{"date":"2026-02-27","name":"Apple cloud","amount":15000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-156"},{"date":"2026-02-27","name":"Ikan","amount":48750,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-157"},{"date":"2026-03-01","name":"TF Mobil","amount":1402500,"type":"expense","group":"FINANCIAL OBLIGATIONS","category":"Installments","source":"BCA Account","id":"seed-158"},{"date":"2026-03-01","name":"Kos Maret","amount":622500,"type":"expense","group":"HOME","category":"Mortgage","source":"BCA Account","id":"seed-159"},{"date":"2026-03-01","name":"Jatinangor","amount":26000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-160"},{"date":"2026-03-01","name":"Soto Betawi","amount":46500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-161"},{"date":"2026-03-02","name":"Mutual Funds Top-up","amount":500000,"type":"expense","group":"INVESTMENTS","category":"Mutual Funds","source":"BCA Account","id":"seed-162"},{"date":"2026-03-02","name":"RDN Top-up","amount":2000000,"type":"expense","group":"INVESTMENTS","category":"RDN Top-up","source":"BCA Account","id":"seed-163"},{"date":"2026-03-03","name":"Ayam gepuk pak gembus","amount":23000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-164"},{"date":"2026-03-04","name":"Deliwings","amount":37550,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-165"},{"date":"2026-03-04","name":"Premi BCA","amount":6812,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-166"},{"date":"2026-03-04","name":"TF Khafid","amount":53000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-167"},{"date":"2026-03-04","name":"Mie ayam","amount":13500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-168"},{"date":"2026-03-05","name":"Payung, flazz, handuk","amount":156328,"type":"expense","group":"DAILY LIVING","category":"Purchases","source":"BCA Account","id":"seed-169"},{"date":"2026-03-05","name":"Kaos","amount":101000,"type":"expense","group":"CREDIT CARD","category":"Clothing","source":"Credit Card BCA","id":"seed-170"},{"date":"2026-03-05","name":"Sahur","amount":24300,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-171"},{"date":"2026-03-05","name":"Indoluxe","amount":65000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-172"},{"date":"2026-03-05","name":"Indomie","amount":20483,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-173"},{"date":"2026-03-05","name":"Seafood","amount":52030,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-174"},{"date":"2026-03-06","name":"Cockroom","amount":78000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-175"},{"date":"2026-03-07","name":"Deliwings","amount":41350,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-176"},{"date":"2026-03-08","name":"Coin Cake","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-177"},{"date":"2026-03-08","name":"Oseng Cumi Hitam","amount":43000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-178"},{"date":"2026-03-09","name":"Paspor","amount":650000,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-179"},{"date":"2026-03-09","name":"Bukber Kakkoii","amount":161000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-180"},{"date":"2026-03-09","name":"Batik","amount":245250,"type":"expense","group":"CREDIT CARD","category":"Clothing","source":"Credit Card BCA","id":"seed-181"},{"date":"2026-03-09","name":"Sahur","amount":42900,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-182"},{"date":"2026-03-10","name":"Olive","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-183"},{"date":"2026-03-10","name":"Mie ayam","amount":15500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-184"},{"date":"2026-03-10","name":"Coca Cola","amount":5700,"type":"expense","group":"DAILY LIVING","category":"Groceries","source":"BCA Account","id":"seed-185"},{"date":"2026-03-10","name":"Parkir","amount":2000,"type":"expense","group":"TRANSPORTATION","category":"Parking","source":"BCA Account","id":"seed-186"},{"date":"2026-03-10","name":"Sahur","amount":28000,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-187"},{"date":"2026-03-11","name":"Bukber minggu","amount":56500,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-188"},{"date":"2026-03-11","name":"Ketoprak","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-189"},{"date":"2026-03-11","name":"Sahur","amount":23800,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-190"},{"date":"2026-03-11","name":"Bensin","amount":23000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-191"},{"date":"2026-03-13","name":"Indomie","amount":12000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-192"},{"date":"2026-03-13","name":"Servis mobil","amount":222500,"type":"expense","group":"TRANSPORTATION","category":"Repairs","source":"BCA Account","id":"seed-193"},{"date":"2026-03-13","name":"RDN Top Up","amount":1655475,"type":"expense","group":"INVESTMENTS","category":"RDN Top-up","source":"BCA Account","id":"seed-194"},{"date":"2026-03-13","name":"Ngopi","amount":32000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-195"},{"date":"2026-03-14","name":"Bensin","amount":20000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-196"},{"date":"2026-03-14","name":"Servis motor","amount":100000,"type":"expense","group":"TRANSPORTATION","category":"Repairs","source":"BCA Account","id":"seed-197"},{"date":"2026-03-14","name":"Ban dalam depan","amount":65000,"type":"expense","group":"TRANSPORTATION","category":"Repairs","source":"BCA Account","id":"seed-198"},{"date":"2026-03-16","name":"Bensin","amount":100000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-199"},{"date":"2026-03-16","name":"Barber","amount":55000,"type":"expense","group":"PERSONAL","category":"Salon/barber","source":"BCA Account","id":"seed-200"},{"date":"2026-03-16","name":"Makan + Sahur","amount":60800,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-201"},{"date":"2026-03-16","name":"Makan","amount":34000,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-202"},{"date":"2026-03-17","name":"Makan","amount":42500,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-203"},{"date":"2026-03-17","name":"Laundry","amount":31800,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-204"},{"date":"2026-03-17","name":"Makan","amount":48250,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-205"},{"date":"2026-03-17","name":"Bangor","amount":38900,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-206"},{"date":"2026-03-21","name":"YT premium","amount":89000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-207"},{"date":"2026-02-24","name":"Atap","amount":55000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-208"},{"date":"2026-02-24","name":"Minum","amount":35500,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-209"},{"date":"2026-02-24","name":"Karaoke","amount":131833,"type":"expense","group":"ENTERTAINMENT","category":"Concerts/clubs","source":"BCA Account","id":"seed-210"},{"date":"2026-02-25","name":"Bensin","amount":13000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-211"},{"date":"2026-02-25","name":"Gym","amount":20000,"type":"expense","group":"RECREATION","category":"Gym fees","source":"BCA Account","id":"seed-212"},{"date":"2026-03-26","name":"THR","amount":100000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-213"},{"date":"2026-03-26","name":"Jam","amount":50000,"type":"expense","group":"HOME","category":"Repairs","source":"BCA Account","id":"seed-214"},{"date":"2026-03-26","name":"Gym","amount":20000,"type":"expense","group":"RECREATION","category":"Gym fees","source":"BCA Account","id":"seed-215"},{"date":"2026-03-27","name":"Internet","amount":75000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-216"},{"date":"2026-03-27","name":"Brisket","amount":193000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-217"},{"date":"2026-03-27","name":"AMRT","amount":1955930,"type":"expense","group":"INVESTMENTS","category":"RDN Top-up","source":"BCA Account","id":"seed-218"},{"date":"2026-03-29","name":"Isi bensin","amount":100000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-219"},{"date":"2026-03-30","name":"Makan","amount":28600,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-220"},{"date":"2026-03-30","name":"Makan Samasta","amount":33000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-221"},{"date":"2026-03-31","name":"Soto","amount":19000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-222"},{"date":"2026-03-31","name":"TF Ibu","amount":200000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-223"},{"date":"2026-03-31","name":"Gym 3 Bulan","amount":590000,"type":"expense","group":"RECREATION","category":"Gym fees","source":"BCA Account","id":"seed-224"},{"date":"2026-03-31","name":"Shopeefood","amount":37750,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-225"},{"date":"2026-04-02","name":"SeIndonesia","amount":49358,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-226"},{"date":"2026-04-02","name":"Fuyunghai","amount":41675,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-227"},{"date":"2026-04-03","name":"Pizza","amount":63640,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-228"},{"date":"2026-04-03","name":"Margin","amount":64955,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-229"},{"date":"2026-04-01","name":"TF Mobil","amount":1402500,"type":"expense","group":"FINANCIAL OBLIGATIONS","category":"Installments","source":"BCA Account","id":"seed-230"},{"date":"2026-04-01","name":"Kos","amount":622500,"type":"expense","group":"HOME","category":"Mortgage","source":"BCA Account","id":"seed-231"},{"date":"2026-04-01","name":"Konser","amount":126837,"type":"expense","group":"ENTERTAINMENT","category":"Concerts/clubs","source":"BCA Account","id":"seed-232"},{"date":"2026-04-01","name":"Sambal Jos","amount":69000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-233"},{"date":"2026-04-01","name":"K3 Mart","amount":25000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-234"},{"date":"2026-04-02","name":"Mutual funds","amount":500000,"type":"expense","group":"INVESTMENTS","category":"Mutual Funds","source":"BCA Account","id":"seed-235"},{"date":"2026-04-02","name":"TF khafid","amount":27000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-236"},{"date":"2026-04-02","name":"RDN Top up","amount":10000,"type":"expense","group":"INVESTMENTS","category":"RDN Top-up","source":"BCA Account","id":"seed-237"},{"date":"2026-04-03","name":"Paket STNK","amount":26000,"type":"expense","group":"HOME","category":"Utilities","source":"BCA Account","id":"seed-238"},{"date":"2026-04-03","name":"Pajak Mobil","amount":1702500,"type":"expense","group":"FINANCIAL OBLIGATIONS","category":"Other obligations","source":"BCA Account","id":"seed-239"},{"date":"2026-04-03","name":"Cuci Mobil","amount":40000,"type":"expense","group":"TRANSPORTATION","category":"Car wash/detailing services","source":"BCA Account","id":"seed-240"},{"date":"2026-04-03","name":"TF Trevoil","amount":50000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-241"},{"date":"2026-04-04","name":"Makan fullday","amount":64000,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-242"},{"date":"2026-04-04","name":"Hanger bass","amount":19000,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-243"},{"date":"2026-04-04","name":"Galon","amount":90500,"type":"expense","group":"DAILY LIVING","category":"Groceries","source":"BCA Account","id":"seed-244"},{"date":"2026-04-04","name":"Karpet","amount":127319,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-245"},{"date":"2026-04-05","name":"Makan fullday","amount":64700,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-246"},{"date":"2026-04-05","name":"Potong rambut","amount":55000,"type":"expense","group":"PERSONAL","category":"Salon/barber","source":"BCA Account","id":"seed-247"},{"date":"2026-04-05","name":"Es teh","amount":5000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-248"},{"date":"2026-04-05","name":"Parkir alfamidi","amount":4000,"type":"expense","group":"TRANSPORTATION","category":"Parking","source":"BCA Account","id":"seed-249"},{"date":"2026-04-05","name":"Belanja","amount":248900,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-250"},{"date":"2026-04-06","name":"Soto jamal","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-251"},{"date":"2026-04-07","name":"Lunch","amount":13000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-252"},{"date":"2026-04-07","name":"Hara chicken","amount":41000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-253"},{"date":"2026-04-08","name":"Fotocopy","amount":1000,"type":"expense","group":"VACATIONS","category":"Accommodations","source":"BCA Account","id":"seed-254"},{"date":"2026-04-08","name":"Materai","amount":21500,"type":"expense","group":"VACATIONS","category":"Accommodations","source":"BCA Account","id":"seed-255"},{"date":"2026-04-08","name":"Ayam Geprek","amount":17500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-256"},{"date":"2026-04-08","name":"Dividen BBCA","amount":112610,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-257"},{"date":"2026-04-08","name":"Martabak","amount":31000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-258"},{"date":"2026-04-09","name":"Nasi Padang","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-259"},{"date":"2026-04-09","name":"Lays","amount":17700,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-260"},{"date":"2026-04-09","name":"Cosan","amount":33000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-261"},{"date":"2026-04-10","name":"TF","amount":180000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-262"},{"date":"2026-04-10","name":"Roti","amount":3000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-263"},{"date":"2026-04-10","name":"Bakmi jawa","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-264"},{"date":"2026-04-11","name":"Makan siang sore","amount":45100,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-265"},{"date":"2026-04-11","name":"Sambal jos","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-266"},{"date":"2026-04-11","name":"Ghost in the Cell","amount":132000,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-267"},{"date":"2026-04-11","name":"TF Khafid","amount":56000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-268"},{"date":"2026-04-11","name":"TF dr Riris","amount":44000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-269"},{"date":"2026-04-12","name":"Makan fullday","amount":61880,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-270"},{"date":"2026-04-13","name":"TF Khafid","amount":62000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-271"},{"date":"2026-04-13","name":"Di TF Khafid","amount":25000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-272"},{"date":"2026-04-13","name":"Olive","amount":15000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-273"},{"date":"2026-04-13","name":"Parkir olive","amount":2000,"type":"expense","group":"TRANSPORTATION","category":"Parking","source":"BCA Account","id":"seed-274"},{"date":"2026-04-14","name":"Burjo","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-275"},{"date":"2026-04-14","name":"TF Khafid","amount":14000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-276"},{"date":"2026-04-15","name":"Mie Newmind","amount":61500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-277"},{"date":"2026-04-15","name":"Unique Chicken","amount":47700,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-278"},{"date":"2026-04-16","name":"Geprek","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-279"},{"date":"2026-04-17","name":"Tonjho","amount":68230,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-280"},{"date":"2026-04-17","name":"Kumis Senin","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-281"},{"date":"2026-04-17","name":"Laundry","amount":42000,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-282"},{"date":"2026-04-17","name":"Parkir","amount":5000,"type":"expense","group":"TRANSPORTATION","category":"Parking","source":"BCA Account","id":"seed-283"},{"date":"2026-04-18","name":"Shopeefood","amount":70060,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-284"},{"date":"2026-04-18","name":"TF Penyetan","amount":38500,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-285"},{"date":"2026-04-19","name":"Hara chicken","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-286"},{"date":"2026-04-19","name":"Bensin","amount":200000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-287"},{"date":"2026-04-19","name":"Es teh","amount":2500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-288"},{"date":"2026-04-19","name":"Sadeyan","amount":162000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-289"},{"date":"2026-04-19","name":"TF Ricu","amount":30000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-290"},{"date":"2026-04-19","name":"TF Cimit GG","amount":66000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-291"},{"date":"2026-04-19","name":"1009 Coffee","amount":151000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-292"},{"date":"2026-04-19","name":"TF Hfz","amount":61000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-293"},{"date":"2026-04-19","name":"TF Ricu","amount":27000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-294"},{"date":"2026-04-19","name":"TF dr Cimit","amount":36000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-295"},{"date":"2026-04-19","name":"Sate","amount":25000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-296"},{"date":"2026-04-20","name":"Laundry","amount":42500,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":null,"id":"seed-297"},{"date":"2026-04-21","name":"Internet","amount":89000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":null,"id":"seed-298"},{"date":"2026-04-21","name":"Mutual funds withdrawal","amount":500013,"type":"income","group":"INCOME","category":"Incoming Transfers","source":null,"id":"seed-299"},{"date":"2026-04-21","name":"Gojek","amount":10500,"type":"expense","group":"CREDIT CARD","category":"Other","source":null,"id":"seed-300"},{"date":"2026-04-21","name":"Maksi","amount":14000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":null,"id":"seed-301"},{"date":"2026-04-21","name":"Servis kaki kaki","amount":5071072,"type":"expense","group":"TRANSPORTATION","category":"Repairs","source":null,"id":"seed-302"},{"date":"2026-04-21","name":"Withdrawal saham","amount":4975103,"type":"income","group":"INCOME","category":"Incoming Transfers","source":null,"id":"seed-303"},{"date":"2026-04-21","name":"Transfer","amount":87000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":null,"id":"seed-304"},{"date":"2026-04-22","name":"Maksi","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Food","source":null,"id":"seed-305"},{"date":"2026-04-22","name":"Shopeefood","amount":36400,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":null,"id":"seed-306"},{"date":"2026-04-23","name":"Maksi","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Food","source":null,"id":"seed-307"},{"date":"2026-04-23","name":"Mutual funds withdrawal","amount":501150,"type":"income","group":"INCOME","category":"Incoming Transfers","source":null,"id":"seed-308"},{"date":"2026-04-23","name":"Hara chicken","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Food","source":null,"id":"seed-309"},{"date":"2026-04-23","name":"Cc bonus","amount":425709,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-310"},{"date":"2026-05-01","name":"Potong rambut","amount":45000,"type":"expense","group":"PERSONAL","category":"Salon/barber","source":"BCA Account","id":"seed-311"},{"date":"2026-05-01","name":"Laundry","amount":37800,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-312"},{"date":"2026-05-01","name":"Cuci mobil","amount":75000,"type":"expense","group":"TRANSPORTATION","category":"Car wash/detailing services","source":"BCA Account","id":"seed-313"},{"date":"2026-05-01","name":"Ngopi","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-314"},{"date":"2026-05-02","name":"Es jeruk","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-315"},{"date":"2026-05-02","name":"Es","amount":10000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-316"},{"date":"2026-05-02","name":"Takoyaki","amount":15000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-317"},{"date":"2026-05-02","name":"Jajan","amount":30000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-318"},{"date":"2026-05-02","name":"Jajan","amount":10000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-319"},{"date":"2026-05-03","name":"Angsuran","amount":1402500,"type":"expense","group":"FINANCIAL OBLIGATIONS","category":"Installments","source":"BCA Account","id":"seed-320"},{"date":"2026-05-03","name":"Kos","amount":622500,"type":"expense","group":"HOME","category":"Mortgage","source":"BCA Account","id":"seed-321"},{"date":"2026-05-03","name":"Cumi","amount":35000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-322"},{"date":"2026-05-03","name":"Matcha","amount":40000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-323"},{"date":"2026-05-03","name":"Okonomiyaki","amount":30000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-324"},{"date":"2026-05-04","name":"Unique Chicken","amount":37850,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-325"},{"date":"2026-05-04","name":"Premi BCA","amount":5828,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-326"},{"date":"2026-05-04","name":"Mutual funds","amount":500000,"type":"expense","group":"INVESTMENTS","category":"Mutual Funds","source":"BCA Account","id":"seed-327"},{"date":"2026-05-04","name":"Olive","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-328"},{"date":"2026-05-04","name":"Parkir Bethesda","amount":10000,"type":"expense","group":"TRANSPORTATION","category":"Parking","source":"BCA Account","id":"seed-329"},{"date":"2026-05-04","name":"Belanja","amount":39900,"type":"expense","group":"DAILY LIVING","category":"Groceries","source":"BCA Account","id":"seed-330"},{"date":"2026-05-04","name":"Makan","amount":32894,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-331"},{"date":"2026-05-05","name":"Makan","amount":27500,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-332"},{"date":"2026-05-05","name":"Bioskop","amount":153600,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-333"},{"date":"2026-05-05","name":"tf khafid","amount":51200,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-334"},{"date":"2026-05-05","name":"Tf riris","amount":51200,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-335"},{"date":"2026-05-05","name":"Bensin","amount":100000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-336"},{"date":"2026-05-06","name":"Makan","amount":39850,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-337"},{"date":"2026-05-06","name":"Top Up RDN","amount":1161740,"type":"expense","group":"INVESTMENTS","category":"RDN Top-up","source":"BCA Account","id":"seed-338"},{"date":"2026-05-06","name":"Ngopi","amount":29000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-339"},{"date":"2026-05-06","name":"Ngemie","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-340"},{"date":"2026-05-07","name":"Gojek","amount":8000,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-341"},{"date":"2026-05-07","name":"Makan Siang","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-342"},{"date":"2026-05-07","name":"Refund Mutual Funds","amount":500000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-343"},{"date":"2026-05-07","name":"Servis Kaki-kaki","amount":1194608,"type":"expense","group":"CREDIT CARD","category":"Other","source":"YUP","id":"seed-344"},{"date":"2026-05-08","name":"Maksi","amount":60875,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"BCA Account","id":"seed-345"},{"date":"2026-05-08","name":"Bayar shopee","amount":375155,"type":"expense","group":"FINANCIAL OBLIGATIONS","category":"Other obligations","source":"BCA Account","id":"seed-346"},{"date":"2026-05-08","name":"Bebek sanjay","amount":67000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-347"},{"date":"2026-05-08","name":"Tf khafid","amount":23000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-348"},{"date":"2026-05-08","name":"Tf riris","amount":21000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-349"},{"date":"2026-05-08","name":"1009 coffee","amount":108000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-350"},{"date":"2026-05-08","name":"Tf khafid","amount":40000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-351"},{"date":"2026-05-11","name":"RDN Top Up","amount":1066598,"type":"expense","group":"INVESTMENTS","category":"RDN Top-up","source":"BCA Account","id":"seed-352"},{"date":"2026-05-11","name":"Olive","amount":15000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-353"},{"date":"2026-05-11","name":"Isi bensin","amount":20000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-354"},{"date":"2026-05-11","name":"Bebek disko","amount":48000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-355"},{"date":"2026-05-11","name":"cimory","amount":8000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-356"},{"date":"2026-05-11","name":"Konser","amount":171887,"type":"expense","group":"ENTERTAINMENT","category":"Concerts/clubs","source":"BCA Account","id":"seed-357"},{"date":"2026-05-12","name":"Rocket","amount":29000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-358"},{"date":"2026-05-12","name":"Rafting","amount":140000,"type":"expense","group":"ENTERTAINMENT","category":"Movies/plays","source":"BCA Account","id":"seed-359"},{"date":"2026-05-12","name":"Jajan bfts","amount":8000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-360"},{"date":"2026-05-12","name":"Mie ayam jumbo","amount":18500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-361"},{"date":"2026-05-13","name":"Hangry","amount":47302,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-362"},{"date":"2026-05-13","name":"Nasi ayam","amount":32040,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-363"},{"date":"2026-05-14","name":"Holy Chick","amount":63500,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-364"},{"date":"2026-05-14","name":"Bangor","amount":39900,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"BCA Account","id":"seed-365"},{"date":"2026-05-15","name":"Hara Chicken","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-366"},{"date":"2026-05-15","name":"Olive","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-367"},{"date":"2026-05-15","name":"Mie ayam","amount":10000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-368"},{"date":"2026-05-15","name":"Oatmilk","amount":4000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-369"},{"date":"2026-05-16","name":"Tonjho","amount":68650,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-370"},{"date":"2026-05-16","name":"Es teh","amount":3000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-371"},{"date":"2026-05-16","name":"Margin","amount":94947,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-372"},{"date":"2026-05-17","name":"Isi bensin","amount":20000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-373"},{"date":"2026-05-17","name":"Indomaret","amount":15000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-374"},{"date":"2026-05-17","name":"Cilok","amount":5000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-375"},{"date":"2026-05-17","name":"Deliwings","amount":58250,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-376"},{"date":"2026-05-17","name":"TF Hfz","amount":53100,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-377"},{"date":"2026-05-18","name":"Hara Chicken","amount":28000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-378"},{"date":"2026-05-18","name":"WBSA","amount":123690,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-379"},{"date":"2026-05-18","name":"Morgans","amount":26000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-380"},{"date":"2026-05-19","name":"Nomojowo","amount":32800,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-381"},{"date":"2026-05-20","name":"Nasyi","amount":35500,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-382"},{"date":"2026-05-20","name":"Isoplus","amount":4000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-383"},{"date":"2026-05-20","name":"Parkir","amount":2000,"type":"expense","group":"TRANSPORTATION","category":"Parking","source":"BCA Account","id":"seed-384"},{"date":"2026-05-21","name":"Unique Chicken","amount":38300,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-385"},{"date":"2026-05-21","name":"Yt Premium","amount":89000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-386"},{"date":"2026-05-21","name":"Pasta","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-387"},{"date":"2026-05-21","name":"Neocon","amount":200000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-388"},{"date":"2026-05-21","name":"Laundry","amount":34650,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-389"},{"date":"2026-05-21","name":"Padang","amount":20500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-390"},{"date":"2026-05-22","name":"Sei","amount":50735,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-391"},{"date":"2026-05-22","name":"Holy chick","amount":52500,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-392"},{"date":"2026-05-23","name":"Gojek","amount":9500,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-393"},{"date":"2026-05-23","name":"Minum","amount":10000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-394"},{"date":"2026-05-23","name":"Gocar","amount":22500,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-395"},{"date":"2026-05-23","name":"Nomojowo","amount":60610,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-396"},{"date":"2026-05-24","name":"Gojek","amount":9500,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-397"},{"date":"2026-05-24","name":"Kaizen","amount":52500,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-398"},{"date":"2026-05-24","name":"TF Riris","amount":175000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-399"},{"date":"2026-05-24","name":"TF Khafid","amount":175000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-400"},{"date":"2026-05-24","name":"Gojek","amount":13500,"type":"expense","group":"CREDIT CARD","category":"Other","source":"Credit Card BCA","id":"seed-401"},{"date":"2026-05-24","name":"TF","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-402"},{"date":"2026-05-25","name":"Dividend","amount":87967,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-403"},{"date":"2026-05-25","name":"Ayam geprek","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-404"},{"date":"2026-05-25","name":"Dividend","amount":130174,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-405"},{"date":"2026-05-25","name":"Bengkel motor","amount":1636000,"type":"expense","group":"CREDIT CARD","category":"Other","source":"YUP","id":"seed-406"},{"date":"2026-05-25","name":"Magelangan","amount":20500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-407"},{"date":"2026-05-25","name":"Bioskop","amount":204800,"type":"expense","group":"CREDIT CARD","category":"Other","source":"YUP","id":"seed-408"},{"date":"2026-05-25","name":"TF bangghul","amount":51200,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-409"},{"date":"2026-05-25","name":"Cash khafid","amount":51200,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-410"},{"date":"2026-05-26","name":"Geprek","amount":18500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-411"},{"date":"2026-05-26","name":"Tf Riris","amount":51200,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-412"},{"date":"2026-05-27","name":"Shopeefood","amount":40050,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-413"},{"date":"2026-05-27","name":"Internet","amount":75000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-414"},{"date":"2026-05-27","name":"Whey","amount":25000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-415"},{"date":"2026-05-27","name":"Unique Chicken","amount":31850,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-416"},{"date":"2026-05-27","name":"Mie ayam","amount":38000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-417"},{"date":"2026-05-28","name":"Salted Egg","amount":54520,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-418"},{"date":"2026-05-28","name":"Unique Chicken","amount":36100,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-419"},{"date":"2026-05-29","name":"Rocket chicken","amount":30000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-420"},{"date":"2026-05-29","name":"TF Fara","amount":100000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-421"},{"date":"2026-05-30","name":"Panoramic","amount":24000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-422"},{"date":"2026-05-30","name":"Sate taichan","amount":59000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-423"},{"date":"2026-05-30","name":"TF Riris","amount":29500,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-424"},{"date":"2026-05-31","name":"Taichan","amount":25000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-425"},{"date":"2026-05-31","name":"Unique Chicken","amount":37320,"type":"expense","group":"CREDIT CARD","category":"Dining out","source":"Credit Card BCA","id":"seed-426"},{"date":"2026-06-01","name":"Deliwings","amount":42525,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-427"},{"date":"2026-06-01","name":"Icloud","amount":15000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-428"},{"date":"2026-06-01","name":"TF Fara","amount":105000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-429"},{"date":"2026-06-01","name":"Kos","amount":622500,"type":"expense","group":"HOME","category":"Mortgage","source":"BCA Account","id":"seed-430"},{"date":"2026-06-01","name":"Padang","amount":37000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-431"},{"date":"2026-06-02","name":"Makan","amount":38900,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-432"},{"date":"2026-06-02","name":"Burjo","amount":14000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-433"},{"date":"2026-06-02","name":"Hara","amount":27000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-434"},{"date":"2026-06-02","name":"Tjeria","amount":27000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-435"},{"date":"2026-06-02","name":"TF Esa","amount":27000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-436"},{"date":"2026-06-03","name":"Roti","amount":4000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-437"},{"date":"2026-06-03","name":"Ikan","amount":13650,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-438"},{"date":"2026-06-03","name":"Premi BCA","amount":7956,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-439"},{"date":"2026-06-04","name":"Padang","amount":22500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-440"},{"date":"2026-06-04","name":"Soes for you","amount":41500,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"Credit Card BCA","id":"seed-441"},{"date":"2026-06-04","name":"Kambing","amount":64000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-442"},{"date":"2026-06-05","name":"Rocket","amount":39000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-443"},{"date":"2026-06-05","name":"Laundry","amount":38150,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-444"},{"date":"2026-06-05","name":"Minum","amount":4000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-445"},{"date":"2026-06-05","name":"Karaoke","amount":140000,"type":"expense","group":"ENTERTAINMENT","category":"Movies/plays","source":"Credit Card BCA","id":"seed-446"},{"date":"2026-06-06","name":"Cash withdrawal","amount":100000,"type":"expense","group":"DAILY LIVING","category":"Groceries","source":"BCA Account","id":"seed-447"},{"date":"2026-06-06","name":"Gym","amount":40000,"type":"expense","group":"RECREATION","category":"Gym fees","source":"BCA Account","id":"seed-448"},{"date":"2026-06-06","name":"Call Me","amount":25000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-449"},{"date":"2026-06-06","name":"Orijien","amount":25500,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-450"},{"date":"2026-06-06","name":"Sambal cowek","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-451"},{"date":"2026-06-07","name":"Belanja","amount":169000,"type":"expense","group":"DAILY LIVING","category":"Groceries","source":"Credit Card BCA","id":"seed-452"},{"date":"2026-06-07","name":"Holy chick","amount":45510,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-453"},{"date":"2026-06-08","name":"Olive","amount":15000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-454"},{"date":"2026-06-08","name":"Aoka","amount":4000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-455"},{"date":"2026-06-08","name":"Bakso","amount":19000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-456"},{"date":"2026-06-09","name":"Omlet","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-457"},{"date":"2026-06-09","name":"Hara","amount":23000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-458"},{"date":"2026-06-09","name":"Mie ayam","amount":18000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-459"},{"date":"2026-06-10","name":"Holy chick","amount":41050,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-460"},{"date":"2026-06-10","name":"Tarik tunai","amount":50000,"type":"expense","group":"DAILY LIVING","category":"Groceries","source":"BCA Account","id":"seed-461"},{"date":"2026-06-10","name":"TF Riris","amount":13500,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-462"},{"date":"2026-06-11","name":"Olive","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-463"},{"date":"2026-06-11","name":"Burjo","amount":19000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-464"},{"date":"2026-06-12","name":"Rocket","amount":31000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-465"},{"date":"2026-06-12","name":"Pocari","amount":6000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-466"},{"date":"2026-06-12","name":"Strap","amount":65000,"type":"expense","group":"RECREATION","category":"Sports equipment","source":"Credit Card BCA","id":"seed-467"},{"date":"2026-06-13","name":"Tarik tunai","amount":150000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-468"},{"date":"2026-06-15","name":"Hara chicken","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-469"},{"date":"2026-06-15","name":"Roti","amount":4000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-470"},{"date":"2026-06-15","name":"Laundry","amount":38920,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-471"},{"date":"2026-06-15","name":"Shopefood","amount":26300,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-472"},{"date":"2026-06-16","name":"Smashroom","amount":245000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"Credit Card BCA","id":"seed-473"},{"date":"2026-06-16","name":"Zarcoon","amount":92000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"Credit Card BCA","id":"seed-474"},{"date":"2026-06-16","name":"Zarcoon","amount":25000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"Credit Card BCA","id":"seed-475"},{"date":"2026-06-16","name":"Hogie","amount":68000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-476"},{"date":"2026-06-16","name":"Nasi Liwet","amount":74000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-477"},{"date":"2026-06-16","name":"Sate Taichan","amount":84000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-478"},{"date":"2026-06-17","name":"Tarik Tunai","amount":50000,"type":"expense","group":"DAILY LIVING","category":"Groceries","source":"BCA Account","id":"seed-479"},{"date":"2026-06-17","name":"Bensin","amount":100000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-480"},{"date":"2026-06-18","name":"TF Khafid","amount":185000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-481"},{"date":"2026-06-18","name":"Jajan","amount":12000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-482"},{"date":"2026-06-18","name":"Makan","amount":53347,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-483"},{"date":"2026-06-19","name":"Creatine","amount":210900,"type":"expense","group":"RECREATION","category":"Sports equipment","source":"Credit Card BCA","id":"seed-484"},{"date":"2026-06-19","name":"TF Jota","amount":13200,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-485"},{"date":"2026-06-19","name":"TF dr Riris","amount":173666,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-486"},{"date":"2026-06-19","name":"Burjo","amount":23000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-487"},{"date":"2026-06-20","name":"TF ke khafid","amount":34500,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-488"},{"date":"2026-06-20","name":"Makan","amount":88320,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-489"},{"date":"2026-06-20","name":"Laundry","amount":34500,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-490"},{"date":"2026-06-20","name":"Unique","amount":54947,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-491"},{"date":"2026-06-21","name":"YT Premium","amount":89000,"type":"expense","group":"CREDIT CARD","category":"Subscriptions","source":"Credit Card BCA","id":"seed-492"},{"date":"2026-06-21","name":"Jajan","amount":6000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-493"},{"date":"2026-06-21","name":"WS","amount":48136,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-494"},{"date":"2026-06-22","name":"Lunch","amount":33000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-495"},{"date":"2026-06-22","name":"Warmindo","amount":39460,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-496"},{"date":"2026-06-23","name":"Tiket Artjog","amount":233001,"type":"expense","group":"ENTERTAINMENT","category":"Movies/plays","source":"YUP","id":"seed-497"},{"date":"2026-06-23","name":"Clothing","amount":1117055,"type":"expense","group":"PERSONAL","category":"Clothing","source":"SPayLater","id":"seed-498"},{"date":"2026-06-23","name":"Makan","amount":43700,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-499"},{"date":"2026-06-24","name":"Shopeefood","amount":37427,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-500"},{"date":"2026-06-24","name":"Jajan","amount":3000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-501"},{"date":"2026-06-24","name":"Poster","amount":20000,"type":"expense","group":"DAILY LIVING","category":"Purchases","source":"BCA Account","id":"seed-502"},{"date":"2026-06-25","name":"Unique Chicken","amount":51864,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-503"},{"date":"2026-06-26","name":"Rocket","amount":50955,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-504"},{"date":"2026-06-26","name":"Internet","amount":75000,"type":"expense","group":"HOME","category":"Utilities","source":"BCA Account","id":"seed-505"},{"date":"2026-06-26","name":"Bensin","amount":150000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-506"},{"date":"2026-06-27","name":"TF Khafid","amount":48000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-507"},{"date":"2026-06-27","name":"Beard Papa","amount":61000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-508"},{"date":"2026-06-27","name":"TF Riris","amount":335500,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-509"},{"date":"2026-06-28","name":"Shopeefood ","amount":49682,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-510"},{"date":"2026-06-28","name":"Warmindo","amount":12500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-511"},{"date":"2026-06-30","name":"Ayam rempah","amount":51200,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-512"},{"date":"2026-06-30","name":"Brick","amount":42000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-513"},{"date":"2026-06-30","name":"Deliwings","amount":46950,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-514"},{"date":"2026-06-30","name":"ICloud","amount":15000,"type":"expense","group":"HOME","category":"Utilities","source":"Credit Card BCA","id":"seed-515"},{"date":"2026-07-01","name":"Kos","amount":622500,"type":"expense","group":"HOME","category":"Mortgage","source":"BCA Account","id":"seed-516"},{"date":"2026-07-01","name":"Servis motor","amount":655000,"type":"expense","group":"TRANSPORTATION","category":"Repairs","source":"BCA Account","id":"seed-517"},{"date":"2026-07-01","name":"Makan","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-518"},{"date":"2026-07-01","name":"Makmur","amount":102000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-519"},{"date":"2026-07-02","name":"Warmindo","amount":14000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-520"},{"date":"2026-07-02","name":"Jajan Bodyfit","amount":4000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-521"},{"date":"2026-07-03","name":"Shopeefood","amount":40087,"type":"expense","group":"DAILY LIVING","category":"Food","source":"Credit Card BCA","id":"seed-522"},{"date":"2026-07-03","name":"Cash withdrawal","amount":100000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-523"},{"date":"2026-07-04","name":"Premi Kredit BCA","amount":7385,"type":"expense","group":"HEALTH","category":"Life insurance","source":"Credit Card BCA","id":"seed-524"},{"date":"2026-07-04","name":"RDN Top Up","amount":40000,"type":"expense","group":"INVESTMENTS","category":"RDN Top-up","source":"BCA Account","id":"seed-525"},{"date":"2026-07-04","name":"Barbershop","amount":30000,"type":"expense","group":"PERSONAL","category":"Salon/barber","source":"BCA Account","id":"seed-526"},{"date":"2026-07-04","name":"Kopi","amount":30000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-527"},{"date":"2026-07-04","name":"Sandwich","amount":53000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-528"},{"date":"2026-07-04","name":"TF Satria","amount":25000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-529"},{"date":"2026-07-04","name":"Bakmi Jawa","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-530"},{"date":"2026-07-05","name":"Gym","amount":20000,"type":"expense","group":"RECREATION","category":"Gym fees","source":"BCA Account","id":"seed-531"},{"date":"2026-07-06","name":"TF Fara","amount":150000,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-532"},{"date":"2026-07-06","name":"TF Khafid","amount":37000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-533"},{"date":"2026-07-06","name":"Claude Subs","amount":360000,"type":"expense","group":"HOME","category":"Utilities","source":"Credit Card BCA","id":"seed-534"},{"date":"2026-07-06","name":"Laundry","amount":51800,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-535"},{"date":"2026-07-06","name":"Bensin","amount":50000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-536"},{"date":"2026-07-07","name":"Los Chicken","amount":32000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-537"},{"date":"2026-07-07","name":"Pilates","amount":75000,"type":"expense","group":"RECREATION","category":"Gym fees","source":"BCA Account","id":"seed-538"},{"date":"2026-07-07","name":"Tarik tunai","amount":100000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-539"},{"date":"2026-07-07","name":"Smoked Duck","amount":90000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-540"},{"date":"2026-07-07","name":"TF Riris","amount":45500,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-541"},{"date":"2026-07-08","name":"Rocket Chicken","amount":39000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-542"},{"date":"2026-07-08","name":"Jajan Bodyfit","amount":4000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-543"},{"date":"2026-07-08","name":"Mierayu","amount":32000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-544"},{"date":"2026-07-09","name":"Padang Djuang","amount":16500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-545"},{"date":"2026-07-09","name":"TF Jogomertan","amount":102500,"type":"expense","group":"DAILY LIVING","category":"Transfers","source":"BCA Account","id":"seed-546"},{"date":"2026-07-09","name":"Jajan Bodyfit","amount":4000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-547"},{"date":"2026-07-10","name":"Olive","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-548"},{"date":"2026-07-10","name":"Unique Chicken","amount":52000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"SPayLater","id":"seed-549"},{"date":"2026-07-10","name":"Jajan Bodyfit","amount":8000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-550"},{"date":"2026-07-10","name":"Sate","amount":17000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-551"},{"date":"2026-07-11","name":"Dawet","amount":8000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-552"},{"date":"2026-07-11","name":"Tamansari","amount":30000,"type":"expense","group":"ENTERTAINMENT","category":"Movies/plays","source":"BCA Account","id":"seed-553"},{"date":"2026-07-11","name":"Tour guide","amount":102500,"type":"expense","group":"ENTERTAINMENT","category":"Movies/plays","source":"BCA Account","id":"seed-554"},{"date":"2026-07-11","name":"Wombats","amount":119000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-555"},{"date":"2026-07-11","name":"TF Ghulam","amount":27000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-556"},{"date":"2026-07-11","name":"Bakso","amount":74000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-557"},{"date":"2026-07-11","name":"TF Ghulam","amount":19000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-558"},{"date":"2026-07-11","name":"Pecel lele","amount":14000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-559"},{"date":"2026-07-13","name":"Soto","amount":17000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-560"},{"date":"2026-07-13","name":"Pulsa","amount":10500,"type":"expense","group":"HOME","category":"Utilities","source":"YUP","id":"seed-561"},{"date":"2026-07-13","name":"TF Khafid","amount":52000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-562"},{"date":"2026-07-13","name":"Kaos Kaki","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Purchases","source":"BCA Account","id":"seed-563"},{"date":"2026-07-13","name":"Mie","amount":34633,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"SPayLater","id":"seed-564"},{"date":"2026-07-13","name":"Ricebox","amount":26520,"type":"expense","group":"DAILY LIVING","category":"Food","source":"SPayLater","id":"seed-565"},{"date":"2026-07-14","name":"eSim","amount":35000,"type":"expense","group":"HOME","category":"Utilities","source":"YUP","id":"seed-566"},{"date":"2026-07-14","name":"Warmindo","amount":26500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-567"},{"date":"2026-07-15","name":"Rocket Chicken","amount":36000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-568"},{"date":"2026-07-15","name":"Pecel lele","amount":36000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-569"},{"date":"2026-07-16","name":"Hara Chicken","amount":31000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-570"},{"date":"2026-07-16","name":"Bu Yayuk","amount":18850,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-571"},{"date":"2026-07-17","name":"Olive","amount":32000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-572"},{"date":"2026-07-17","name":"Panorama","amount":21000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-573"},{"date":"2026-07-18","name":"Bu Yayuk","amount":68100,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-574"},{"date":"2026-07-19","name":"Alfamart","amount":34800,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-575"},{"date":"2026-07-19","name":"TF Riris","amount":36000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-576"},{"date":"2026-07-19","name":"TF Gusti","amount":35000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-577"},{"date":"2026-07-19","name":"TF Khafid","amount":36000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-578"},{"date":"2026-07-19","name":"Bangor","amount":66500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"YUP","id":"seed-579"},{"date":"2026-07-19","name":"Lum Lum","amount":145500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"YUP","id":"seed-580"},{"date":"2026-07-20","name":"RDN Gain","amount":137081,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-581"},{"date":"2026-07-20","name":"Laundry","amount":32700,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-582"},{"date":"2026-07-20","name":"Panorama","amount":40000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-583"},{"date":"2026-07-21","name":"Unique Chicken","amount":37250,"type":"expense","group":"DAILY LIVING","category":"Food","source":"SPayLater","id":"seed-584"},{"date":"2026-07-22","name":"TF Rika","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-585"},{"date":"2026-07-22","name":"TF Rika","amount":22000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-586"},{"date":"2026-07-22","name":"Air es","amount":4000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-587"},{"date":"2026-07-22","name":"Nomojowo","amount":64120,"type":"expense","group":"DAILY LIVING","category":"Food","source":"SPayLater","id":"seed-588"},{"date":"2026-07-24","name":"Burjo Andeska","amount":11300,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-589"},{"date":"2026-07-24","name":"Paket Indosat","amount":70000,"type":"expense","group":"HOME","category":"Utilities","source":"YUP","id":"seed-590"},{"date":"2026-07-25","name":"Jajan taman","amount":55700,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-591"},{"date":"2026-07-25","name":"Holy chicken","amount":26200,"type":"expense","group":"DAILY LIVING","category":"Food","source":"SPayLater","id":"seed-592"},{"date":"2026-07-26","name":"Alfamidi","amount":56300,"type":"expense","group":"DAILY LIVING","category":"Groceries","source":"BCA Account","id":"seed-593"},{"date":"2026-07-26","name":"Sate taichan","amount":37000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"SPayLater","id":"seed-594"},{"date":"2026-07-26","name":"Moufu","amount":76000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"YUP","id":"seed-595"},{"date":"2026-07-27","name":"Los Chicken","amount":66000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-596"},{"date":"2026-07-27","name":"TF Fara","amount":34000,"type":"income","group":"INCOME","category":"Incoming Transfers","source":"BCA Account","id":"seed-597"},{"date":"2026-08-01","name":"Apple Sub","amount":15000,"type":"expense","group":"HOME","category":"Utilities","source":"Credit Card BCA","id":"seed-598"},{"date":"2026-08-01","name":"Nabung ","amount":1000000,"type":"expense","group":"INVESTMENTS","category":"Forex","source":"BCA Account","id":"seed-599"},{"date":"2026-08-01","name":"Kos","amount":622500,"type":"expense","group":"HOME","category":"Mortgage","source":"BCA Account","id":"seed-600"},{"date":"2026-08-01","name":"Laparya","amount":81700,"type":"expense","group":"DAILY LIVING","category":"Food","source":"SPayLater","id":"seed-601"},{"date":"2026-08-02","name":"Topup Gopay","amount":21000,"type":"expense","group":"HOME","category":"Utilities","source":"BCA Account","id":"seed-602"},{"date":"2026-08-02","name":"Es potong","amount":16000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-603"},{"date":"2026-08-02","name":"Flazz","amount":20000,"type":"expense","group":"HOME","category":"Utilities","source":"BCA Account","id":"seed-604"},{"date":"2026-08-02","name":"Kopi","amount":35800,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-605"},{"date":"2026-08-02","name":"Es Teh","amount":3000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-606"},{"date":"2026-08-02","name":"Cak Irwan","amount":17000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-607"},{"date":"2026-08-02","name":"Spiderman","amount":165000,"type":"expense","group":"ENTERTAINMENT","category":"Movies/plays","source":"YUP","id":"seed-608"},{"date":"2026-08-03","name":"Taichan","amount":44000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-609"},{"date":"2026-08-03","name":"Nico","amount":48032,"type":"expense","group":"DAILY LIVING","category":"Food","source":"SPayLater","id":"seed-610"},{"date":"2026-08-03","name":"Bangor","amount":41700,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"SPayLater","id":"seed-611"},{"date":"2026-08-04","name":"Salatiga Housing","amount":302500,"type":"expense","group":"VACATIONS","category":"Accommodations","source":"BCA Account","id":"seed-612"},{"date":"2026-08-04","name":"Rocket chicken","amount":9000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-613"},{"date":"2026-08-05","name":"DB Otomatis","amount":45000,"type":"expense","group":"HOME","category":"Utilities","source":"BCA Account","id":"seed-614"},{"date":"2026-08-05","name":"Siomay","amount":18500,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-615"},{"date":"2026-08-05","name":"Laundry","amount":38920,"type":"expense","group":"DAILY LIVING","category":"Laundry","source":"BCA Account","id":"seed-616"},{"date":"2026-08-05","name":"Claude","amount":356000,"type":"expense","group":"HOME","category":"Utilities","source":"Credit Card BCA","id":"seed-617"},{"date":"2026-08-05","name":"Sei Sapi","amount":45900,"type":"expense","group":"DAILY LIVING","category":"Food","source":"SPayLater","id":"seed-618"},{"date":"2026-08-05","name":"Daily Deli","amount":264000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"YUP","id":"seed-619"},{"date":"2026-08-06","name":"Rocket chicken","amount":23000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-620"},{"date":"2026-08-07","name":"Hara Chicken","amount":23000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-621"},{"date":"2026-08-07","name":"Nobo","amount":4000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-622"},{"date":"2026-08-07","name":"Rubah Coffee","amount":68000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"BCA Account","id":"seed-623"},{"date":"2026-08-07","name":"Mas Kobis","amount":38250,"type":"expense","group":"DAILY LIVING","category":"Food","source":"SPayLater","id":"seed-624"},{"date":"2026-08-08","name":"Bensin","amount":50000,"type":"expense","group":"TRANSPORTATION","category":"Gas/fuel","source":"BCA Account","id":"seed-625"},{"date":"2026-08-08","name":"Konser","amount":351438,"type":"expense","group":"ENTERTAINMENT","category":"Concerts/clubs","source":"YUP","id":"seed-626"},{"date":"2026-08-08","name":"Cold n Brew","amount":48000,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"YUP","id":"seed-627"},{"date":"2026-08-09","name":"Five O","amount":30000,"type":"expense","group":"PERSONAL","category":"Salon/barber","source":"YUP","id":"seed-628"},{"date":"2026-08-09","name":"Verre","amount":19500,"type":"expense","group":"DAILY LIVING","category":"Treat food","source":"YUP","id":"seed-629"},{"date":"2026-08-10","name":"Cak Kumis","amount":15000,"type":"expense","group":"DAILY LIVING","category":"Food","source":"BCA Account","id":"seed-630"}];

/* ---------------------------------------------------------
   HELPERS
--------------------------------------------------------- */

const fmtIDR = (n) => {
  const v = Math.round(n || 0);
  const neg = v < 0;
  const s = Math.abs(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return (neg ? "-Rp " : "Rp ") + s;
};

const fmtShort = (n) => {
  const v = Math.round(n || 0);
  const abs = Math.abs(v);
  if (abs >= 1000000) return (v / 1000000).toFixed(abs >= 10000000 ? 0 : 1) + "jt";
  if (abs >= 1000) return (v / 1000).toFixed(0) + "rb";
  return v.toString();
};

const monthKey = (dateStr) => dateStr ? dateStr.slice(0, 7) : "";
const monthLabel = (mk) => {
  if (!mk) return "";
  const [y, m] = mk.split("-");
  return MONTH_LABELS[parseInt(m, 10) - 1] + " " + y;
};

const uid = () => "t-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------------------------------------------------------
   INVESTMENT BALANCE ENGINE
   Walks all investment-related transactions in date order and
   tracks a running balance per investment category. A withdrawal
   flagged "closesPosition" wipes that category's balance to 0 and
   records the gap to/from the tracked balance as a realized gain
   or loss for that month.
--------------------------------------------------------- */

function computeInvestments(transactions) {
  const relevant = transactions
    .filter(
      (t) =>
        (t.type === "expense" && t.group === "INVESTMENTS") ||
        (t.type === "income" && t.category === "Investment Withdrawal")
    )
    .slice()
    .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

  const balances = {};
  INVESTMENT_CATEGORIES.forEach((c) => (balances[c] = 0));
  const realizedEvents = []; // { date, mk, category, amount }

  relevant.forEach((t) => {
    if (t.type === "expense") {
      balances[t.category] = (balances[t.category] || 0) + t.amount;
    } else {
      const cat = t.investmentCategory || INVESTMENT_CATEGORIES[0];
      if (t.closesPosition) {
        const before = balances[cat] || 0;
        const realized = t.amount - before;
        balances[cat] = 0;
        realizedEvents.push({ date: t.date, mk: monthKey(t.date), category: cat, amount: realized });
      } else {
        balances[cat] = (balances[cat] || 0) - t.amount;
      }
    }
  });

  const total = Object.values(balances).reduce((a, b) => a + b, 0);
  return { balances, total, realizedEvents };
}

/* ---------------------------------------------------------
   STORAGE
   Data lives only in this browser's localStorage — nothing is
   sent anywhere. Use the Data tab in-app to export/import a
   backup and move data between devices.
--------------------------------------------------------- */

const STORAGE_KEY = "axel-budget-transactions-v1";

async function loadTransactions() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // storage unavailable or empty
  }
  return null;
}

async function saveTransactions(txns) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(txns));
  } catch (e) {
    console.error("save failed", e);
  }
}

/* ---------------------------------------------------------
   SMALL UI PRIMITIVES
--------------------------------------------------------- */

function Pill({ children, tone = "ink" }) {
  const tones = {
    ink: { background: "var(--ink)", color: "var(--paper)" },
    lime: { background: "var(--lime)", color: "var(--ink)" },
    blue: { background: "var(--blue)", color: "var(--paper)" },
    outline: { background: "transparent", color: "var(--ink)", border: "1.5px solid var(--ink)" },
  };
  return (
    <span
      style={{
        ...tones[tone],
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 14px",
        borderRadius: 999,
        fontSize: 12.5,
        fontWeight: 700,
        letterSpacing: "0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function IconPlus(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M8 2.5V13.5M2.5 8H13.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function IconArrowUp(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M8 13V3M8 3L3.5 7.5M8 3L12.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconArrowDown(props) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M8 3V13M8 13L3.5 8.5M8 13L12.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconTrash(props) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" {...props}>
      <path d="M3 4.5H13M6 4.5V2.8C6 2.36 6.36 2 6.8 2H9.2C9.64 2 10 2.36 10 2.8V4.5M6.8 7.5V11.5M9.2 7.5V11.5M4 4.5L4.6 12.7C4.64 13.28 5.12 13.7 5.7 13.7H10.3C10.88 13.7 11.36 13.28 11.4 12.7L12 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------------------------------------------------
   ROOT APP
--------------------------------------------------------- */

export default function App() {
  const [transactions, setTransactions] = useState(null);
  const [tab, setTab] = useState("overview");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    (async () => {
      const stored = await loadTransactions();
      if (stored && stored.length) {
        setTransactions(stored);
      } else {
        setTransactions(SEED_TRANSACTIONS);
        await saveTransactions(SEED_TRANSACTIONS);
      }
    })();
  }, []);

  const months = useMemo(() => {
    if (!transactions) return [];
    const set = new Set(transactions.map((t) => monthKey(t.date)));
    return Array.from(set).sort();
  }, [transactions]);

  useEffect(() => {
    if (months.length && !selectedMonth) setSelectedMonth(months[months.length - 1]);
  }, [months]);

  const showToast = (msg) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  const addTransaction = async (t) => {
    const next = [...transactions, { ...t, id: uid() }].sort((a, b) => (a.date < b.date ? 1 : -1));
    setTransactions(next);
    await saveTransactions(next);
    showToast("Entry added");
  };

  const deleteTransaction = async (id) => {
    const next = transactions.filter((t) => t.id !== id);
    setTransactions(next);
    await saveTransactions(next);
    showToast("Entry removed");
  };

  const importTransactions = async (incoming, mode) => {
    let next;
    if (mode === "replace") {
      next = incoming.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
    } else {
      const byId = new Map(transactions.map((t) => [t.id, t]));
      let added = 0;
      incoming.forEach((t) => {
        if (!byId.has(t.id)) {
          byId.set(t.id, t);
          added += 1;
        }
      });
      next = Array.from(byId.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
      setTransactions(next);
      await saveTransactions(next);
      showToast(added > 0 ? `Imported ${added} new entr${added === 1 ? "y" : "ies"}` : "Nothing new to import");
      return;
    }
    setTransactions(next);
    await saveTransactions(next);
    showToast(`Replaced with ${next.length} entries`);
  };

  if (!transactions) {
    return (
      <Shell>
        <div style={{ padding: 60, textAlign: "center", color: "var(--muted)", fontWeight: 600 }}>
          Loading your budget…
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header tab={tab} setTab={setTab} />
      <div style={{ padding: "0 20px 100px" }}>
        {tab === "overview" && (
          <Overview transactions={transactions} months={months} />
        )}
        {tab === "add" && <AddEntry onAdd={addTransaction} months={months} />}
        {tab === "categories" && <CategoryMatrix transactions={transactions} months={months} />}
        {tab === "entries" && (
          <EntryList
            transactions={transactions}
            months={months}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            onDelete={deleteTransaction}
          />
        )}
        {tab === "data" && <DataTab transactions={transactions} onImport={importTransactions} showToast={showToast} />}
      </div>
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--ink)",
            color: "var(--paper)",
            padding: "12px 22px",
            borderRadius: 999,
            fontWeight: 700,
            fontSize: 13.5,
            boxShadow: "0 8px 24px rgba(20,22,26,0.25)",
            zIndex: 50,
          }}
        >
          {toast}
        </div>
      )}
    </Shell>
  );
}

/* ---------------------------------------------------------
   SHELL / THEME
--------------------------------------------------------- */

function Shell({ children }) {
  return (
    <div
      style={{
        "--ink": "#14161A",
        "--paper": "#EFEDF5",
        "--white": "#FFFFFF",
        "--blue": "#2E44F2",
        "--blue-deep": "#1E2FB8",
        "--lime": "#D3FF4D",
        "--muted": "#6B6E7A",
        "--line": "rgba(20,22,26,0.10)",
        "--red": "#E5484D",
        fontFamily: "'Space Grotesk', 'Inter', -apple-system, sans-serif",
        background: "var(--paper)",
        minHeight: "100vh",
        color: "var(--ink)",
        maxWidth: 560,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; }
        input, select, button { font-family: inherit; }
        input:focus, select:focus { outline: none; }
        ::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   HEADER + TABS
--------------------------------------------------------- */

function Header({ tab, setTab }) {
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "categories", label: "Categories" },
    { id: "entries", label: "Entries" },
    { id: "add", label: "Add" },
    { id: "data", label: "Data" },
  ];
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 10, background: "var(--paper)", paddingTop: 22 }}>
      <div style={{ padding: "0 20px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, letterSpacing: "-0.01em", lineHeight: 1.15 }}>
              Daily
              <br />
              <span style={{ position: "relative", display: "inline-block" }}>
                Budgeting
                <svg
                  width="120"
                  height="10"
                  viewBox="0 0 120 10"
                  style={{ position: "absolute", left: 0, bottom: -6 }}
                >
                  <path d="M2 7C28 2 92 2 118 7" stroke="var(--lime)" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", marginTop: 10 }}>by Axel Dilvala</div>
          </div>
          <Pill tone="ink">2026</Pill>
        </div>
      </div>
      <div
        className="no-scrollbar"
        style={{
          display: "flex",
          gap: 8,
          padding: "18px 20px 14px",
          overflowX: "auto",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "9px 16px",
              borderRadius: 999,
              border: "none",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              flexShrink: 0,
              background: tab === t.id ? "var(--blue)" : "var(--white)",
              color: tab === t.id ? "var(--white)" : "var(--ink)",
              transition: "background 0.15s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   CARD PRIMITIVE
--------------------------------------------------------- */

function Card({ children, tone = "white", style }) {
  const bg = tone === "ink" ? "var(--ink)" : tone === "blue" ? "var(--blue)" : tone === "lime" ? "var(--lime)" : "var(--white)";
  const color = tone === "ink" || tone === "blue" ? "var(--white)" : "var(--ink)";
  return (
    <div
      style={{
        background: bg,
        color,
        borderRadius: 20,
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ---------------------------------------------------------
   OVERVIEW TAB
--------------------------------------------------------- */

function MonthPicker({ months, selectedMonth, setSelectedMonth, includeAll }) {
  return (
    <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
      {includeAll && (
        <button
          onClick={() => setSelectedMonth("ALL")}
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 999,
            border: "ALL" === selectedMonth ? "none" : "1.5px solid var(--line)",
            background: "ALL" === selectedMonth ? "var(--blue)" : "transparent",
            color: "ALL" === selectedMonth ? "var(--white)" : "var(--ink)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Whole Year
        </button>
      )}
      {months.map((mk) => (
        <button
          key={mk}
          onClick={() => setSelectedMonth(mk)}
          style={{
            flexShrink: 0,
            padding: "8px 14px",
            borderRadius: 999,
            border: mk === selectedMonth ? "none" : "1.5px solid var(--line)",
            background: mk === selectedMonth ? "var(--ink)" : "transparent",
            color: mk === selectedMonth ? "var(--white)" : "var(--ink)",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          {monthLabel(mk)}
        </button>
      ))}
    </div>
  );
}

function periodLabel(mk) {
  return mk === "ALL" ? "Whole Year" : monthLabel(mk);
}

function Overview({ transactions, months }) {
  const [period, setPeriod] = useState(null);
  useEffect(() => {
    if (months.length && !period) setPeriod(months[months.length - 1]);
  }, [months]);
  const selectedMonth = period || "ALL";
  const setSelectedMonth = setPeriod;

  const monthTxns = useMemo(
    () => transactions.filter((t) => (selectedMonth === "ALL" ? true : monthKey(t.date) === selectedMonth)),
    [transactions, selectedMonth]
  );

  const income = monthTxns.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = monthTxns.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  const prevIdx = months.indexOf(selectedMonth) - 1;
  const prevMonth = prevIdx >= 0 ? months[prevIdx] : null;
  const prevExpense = prevMonth
    ? transactions.filter((t) => monthKey(t.date) === prevMonth && t.type === "expense").reduce((s, t) => s + t.amount, 0)
    : null;
  const expenseDelta = prevExpense != null && prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : null;

  const chartData = useMemo(() => {
    return months.map((mk) => {
      const rows = transactions.filter((t) => monthKey(t.date) === mk);
      const inc = rows.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const exp = rows.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      return { month: monthLabel(mk).split(" ")[0], income: inc, expense: exp, mk };
    });
  }, [transactions, months]);

  const groupTotals = useMemo(() => {
    const totals = {};
    monthTxns.filter((t) => t.type === "expense").forEach((t) => {
      totals[t.group] = (totals[t.group] || 0) + t.amount;
    });
    return Object.entries(totals).sort((a, b) => b[1] - a[1]);
  }, [monthTxns]);


  const topCategory = groupTotals[0];

  const investments = useMemo(() => computeInvestments(transactions), [transactions]);
  const realizedFiltered = investments.realizedEvents.filter((e) => (selectedMonth === "ALL" ? true : e.mk === selectedMonth));
  const realizedThisMonth = realizedFiltered.reduce((s, e) => s + e.amount, 0);
  const hasRealizedThisMonth = realizedFiltered.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <MonthPicker months={months} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} includeAll />

      <Card tone="ink" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.65, marginBottom: 6 }}>
          NET CASH FLOW — {periodLabel(selectedMonth).toUpperCase()}
        </div>
        <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
          {fmtIDR(net)}
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 16 }}>
          <div>
            <div style={{ fontSize: 11.5, opacity: 0.6, fontWeight: 600, marginBottom: 2 }}>Income</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--lime)" }}>{fmtIDR(income)}</div>
          </div>
          <div>
            <div style={{ fontSize: 11.5, opacity: 0.6, fontWeight: 600, marginBottom: 2 }}>Expenses</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{fmtIDR(expense)}</div>
          </div>
        </div>
        <svg width="120" height="120" viewBox="0 0 120 120" style={{ position: "absolute", right: -20, top: -20, opacity: 0.9 }}>
          <circle cx="60" cy="60" r="50" fill="none" stroke="var(--lime)" strokeWidth="2" opacity="0.35" />
        </svg>
      </Card>

      <div style={{ display: "flex", gap: 12 }}>
        <Card style={{ flex: 1, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>VS LAST MONTH</div>
          {expenseDelta == null ? (
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}>—</div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: expenseDelta > 0 ? "var(--red)" : "#2E9B5B" }}>
              {expenseDelta > 0 ? <IconArrowUp /> : <IconArrowDown />}
              <span style={{ fontSize: 17, fontWeight: 700 }}>{Math.abs(expenseDelta).toFixed(0)}%</span>
            </div>
          )}
        </Card>
        <Card style={{ flex: 1, padding: 16 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--muted)", marginBottom: 6 }}>TOP CATEGORY</div>
          {topCategory ? (
            <>
              <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 2 }}>{topCategory[0]}</div>
              <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{fmtShort(topCategory[1])}</div>
            </>
          ) : (
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--muted)" }}>—</div>
          )}
        </Card>
      </div>

      <Card>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginBottom: 14 }}>
          INCOME VS EXPENSE — ALL MONTHS
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} barGap={3} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--line)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: "var(--muted)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={40} />
            <Tooltip
              formatter={(v) => fmtIDR(v)}
              contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 8px 24px rgba(20,22,26,0.15)", fontSize: 12.5, fontWeight: 600 }}
            />
            <Bar dataKey="income" fill="#D3FF4D" radius={[4, 4, 0, 0]} maxBarSize={12} />
            <Bar dataKey="expense" fill="#2E44F2" radius={[4, 4, 0, 0]} maxBarSize={12} />
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "#D3FF4D" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Income</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: "#2E44F2" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>Expense</span>
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--muted)", marginBottom: 14 }}>
          SPENDING BY GROUP — {periodLabel(selectedMonth).toUpperCase()}
        </div>
        {groupTotals.length === 0 && (
          <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 600, padding: "10px 0" }}>
            No expenses logged this month yet.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {groupTotals.map(([group, amount]) => {
            const pct = expense > 0 ? (amount / expense) * 100 : 0;
            return (
              <div key={group}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                  <span>{group}</span>
                  <span style={{ color: "var(--muted)", fontWeight: 600 }}>{fmtIDR(amount)}</span>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: "var(--paper)", overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: "var(--blue)", borderRadius: 999 }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card tone="blue">
        <div style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.75, marginBottom: 6 }}>INVESTMENTS — CURRENT BALANCE</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 14 }}>{fmtIDR(investments.total)}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {INVESTMENT_CATEGORIES.map((cat) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, opacity: 0.9 }}>
              <span>{cat}</span>
              <span>{fmtShort(investments.balances[cat] || 0)}</span>
            </div>
          ))}
        </div>
        {hasRealizedThisMonth && (
          <div
            style={{
              marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.2)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12.5, fontWeight: 700, opacity: 0.8 }}>
              {selectedMonth === "ALL" ? "Realized this year" : "Realized this month"}
            </span>
            <span style={{ fontSize: 15, fontWeight: 700, color: realizedThisMonth >= 0 ? "var(--lime)" : "#FF9D9D" }}>
              {realizedThisMonth >= 0 ? "+" : ""}
              {fmtIDR(realizedThisMonth)}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}


/* ---------------------------------------------------------
   CATEGORY MATRIX TAB
--------------------------------------------------------- */

function CategoryMatrix({ transactions, months }) {
  const [openGroups, setOpenGroups] = useState(() => new Set([GROUP_ORDER[0]]));
  const [view, setView] = useState("expense");

  const data = useMemo(() => {
    const map = {};
    transactions.forEach((t) => {
      if (t.type !== view) return;
      const mk = monthKey(t.date);
      const group = t.type === "income" ? "INCOME" : t.group;
      const cat = t.category;
      map[group] = map[group] || {};
      map[group][cat] = map[group][cat] || {};
      map[group][cat][mk] = (map[group][cat][mk] || 0) + t.amount;
    });
    return map;
  }, [transactions, view]);

  const groupsToShow = view === "income" ? ["INCOME"] : GROUP_ORDER;

  const toggle = (g) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      next.has(g) ? next.delete(g) : next.add(g);
      return next;
    });
  };

  const groupMonthTotal = (group, mk) => {
    const cats = data[group];
    if (!cats) return 0;
    return Object.values(cats).reduce((s, byMonth) => s + (byMonth[mk] || 0), 0);
  };

  const grandTotal = (group) => {
    const cats = data[group];
    if (!cats) return 0;
    return Object.values(cats).reduce((s, byMonth) => s + Object.values(byMonth).reduce((a, b) => a + b, 0), 0);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setView("expense")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            background: view === "expense" ? "var(--blue)" : "var(--white)", color: view === "expense" ? "var(--white)" : "var(--ink)",
          }}
        >
          Expenses
        </button>
        <button
          onClick={() => setView("income")}
          style={{
            flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
            background: view === "income" ? "var(--blue)" : "var(--white)", color: view === "income" ? "var(--white)" : "var(--ink)",
          }}
        >
          Income
        </button>
      </div>

      <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, padding: "0 2px" }}>
        Tap a group to see it broken down month to month, side by side.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {groupsToShow.map((group) => {
          const isOpen = openGroups.has(group);
          const total = grandTotal(group);
          if (total === 0 && view === "expense") {
            // still show, but visually muted — skip fully empty groups for income view noise
          }
          const cats = view === "income" ? INCOME_CATEGORIES : CATEGORY_GROUPS[group];

          return (
            <Card key={group} style={{ padding: 0, overflow: "hidden" }}>
              <button
                onClick={() => toggle(group)}
                style={{
                  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "16px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left",
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{group}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>{fmtIDR(total)} total</div>
                </div>
                <div
                  style={{
                    width: 26, height: 26, borderRadius: 999, background: "var(--paper)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.15s ease", flexShrink: 0,
                  }}
                >
                  <IconPlus />
                </div>
              </button>

              {isOpen && (
                <div style={{ overflowX: "auto" }} className="no-scrollbar">
                  <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 12 }}>
                    <thead>
                      <tr style={{ borderTop: "1px solid var(--line)" }}>
                        <th
                          style={{
                            textAlign: "left", padding: "10px 18px", fontWeight: 700, color: "var(--muted)",
                            position: "sticky", left: 0, background: "var(--white)", minWidth: 130, fontSize: 11,
                          }}
                        >
                          CATEGORY
                        </th>
                        {months.map((mk) => (
                          <th key={mk} style={{ textAlign: "right", padding: "10px 12px", fontWeight: 700, color: "var(--muted)", minWidth: 78, fontSize: 11 }}>
                            {monthLabel(mk).split(" ")[0]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cats.map((cat) => {
                        const rowData = (data[group] && data[group][cat]) || {};
                        const rowTotal = Object.values(rowData).reduce((a, b) => a + b, 0);
                        if (rowTotal === 0) return null;
                        return (
                          <tr key={cat} style={{ borderTop: "1px solid var(--line)" }}>
                            <td style={{ padding: "10px 18px", fontWeight: 600, position: "sticky", left: 0, background: "var(--white)" }}>
                              {cat}
                            </td>
                            {months.map((mk) => (
                              <td key={mk} style={{ textAlign: "right", padding: "10px 12px", fontWeight: 600, color: rowData[mk] ? "var(--ink)" : "var(--line)" }}>
                                {rowData[mk] ? fmtShort(rowData[mk]) : "–"}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                      <tr style={{ borderTop: "1.5px solid var(--ink)" }}>
                        <td style={{ padding: "10px 18px", fontWeight: 700, position: "sticky", left: 0, background: "var(--white)" }}>Total</td>
                        {months.map((mk) => (
                          <td key={mk} style={{ textAlign: "right", padding: "10px 12px", fontWeight: 700 }}>
                            {fmtShort(groupMonthTotal(group, mk))}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}


/* ---------------------------------------------------------
   ENTRY LIST TAB
--------------------------------------------------------- */

function EntryList({ transactions, months, selectedMonth, setSelectedMonth, onDelete }) {
  const [filter, setFilter] = useState("all");
  const [confirmId, setConfirmId] = useState(null);

  const rows = useMemo(() => {
    return transactions
      .filter((t) => monthKey(t.date) === selectedMonth)
      .filter((t) => filter === "all" || t.type === filter)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, selectedMonth, filter]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <MonthPicker months={months} selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />

      <div style={{ display: "flex", gap: 8 }}>
        {["all", "expense", "income"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 14px", borderRadius: 999, border: "none", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
              background: filter === f ? "var(--ink)" : "var(--white)", color: filter === f ? "var(--white)" : "var(--ink)",
              textTransform: "capitalize",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {rows.length === 0 && (
          <Card style={{ textAlign: "center", color: "var(--muted)", fontWeight: 600, fontSize: 13.5 }}>
            No entries for {monthLabel(selectedMonth)}.
          </Card>
        )}
        {rows.map((t) => (
          <Card key={t.id} style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                background: t.type === "income" ? "var(--lime)" : "var(--paper)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {t.type === "income" ? <IconArrowDown style={{ transform: "rotate(180deg)" }} /> : <IconArrowUp style={{ transform: "rotate(180deg)" }} />}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t.name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 2 }}>
                {t.date} · {t.category}
                {t.investmentCategory ? ` (${t.investmentCategory}${t.closesPosition ? ", closed" : ""})` : ""}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: t.type === "income" ? "#2E9B5B" : "var(--ink)" }}>
                {t.type === "income" ? "+" : "-"}{fmtShort(t.amount)}
              </div>
            </div>
            {confirmId === t.id ? (
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button
                  onClick={() => { onDelete(t.id); setConfirmId(null); }}
                  style={{ background: "var(--red)", color: "white", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  Delete
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  style={{ background: "var(--paper)", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmId(t.id)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", padding: 6, flexShrink: 0 }}
              >
                <IconTrash />
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}


/* ---------------------------------------------------------
   ADD ENTRY TAB
--------------------------------------------------------- */

function AddEntry({ onAdd, months }) {
  const [type, setType] = useState("expense");
  const [date, setDate] = useState(todayISO());
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [group, setGroup] = useState(GROUP_ORDER[0]);
  const [category, setCategory] = useState(CATEGORY_GROUPS[GROUP_ORDER[0]][0]);
  const [incomeCategory, setIncomeCategory] = useState(INCOME_CATEGORIES[0]);
  const [investmentCategory, setInvestmentCategory] = useState(INVESTMENT_CATEGORIES[0]);
  const [closesPosition, setClosesPosition] = useState(false);
  const [source, setSource] = useState(SOURCES[0]);
  const [error, setError] = useState("");

  const handleGroupChange = (g) => {
    setGroup(g);
    setCategory(CATEGORY_GROUPS[g][0]);
  };

  const reset = () => {
    setName("");
    setAmount("");
  };

  const submit = () => {
    const amt = parseFloat(String(amount).replace(/[^0-9.]/g, ""));
    if (!name.trim()) { setError("Give this entry a name."); return; }
    if (!amt || amt <= 0) { setError("Enter an amount greater than zero."); return; }
    if (!date) { setError("Pick a date."); return; }
    setError("");
    const entry = {
      date,
      name: name.trim(),
      amount: amt,
      type,
      group: type === "income" ? "INCOME" : group,
      category: type === "income" ? incomeCategory : category,
      source,
    };
    if (type === "income" && incomeCategory === "Investment Withdrawal") {
      entry.investmentCategory = investmentCategory;
      entry.closesPosition = closesPosition;
    }
    onAdd(entry);
    reset();
    setClosesPosition(false);
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 12,
    border: "1.5px solid var(--line)",
    background: "var(--white)",
    fontSize: 14.5,
    fontWeight: 600,
    color: "var(--ink)",
  };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 6, display: "block" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setType("expense")}
          style={{
            flex: 1, padding: "13px 0", borderRadius: 14, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
            background: type === "expense" ? "var(--ink)" : "var(--white)", color: type === "expense" ? "var(--white)" : "var(--ink)",
          }}
        >
          Expense
        </button>
        <button
          onClick={() => setType("income")}
          style={{
            flex: 1, padding: "13px 0", borderRadius: 14, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
            background: type === "income" ? "var(--lime)" : "var(--white)", color: "var(--ink)",
          }}
        >
          Income
        </button>
      </div>

      <Card style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>DESCRIPTION</label>
          <input
            style={inputStyle}
            placeholder={type === "income" ? "e.g. Monthly wages" : "e.g. Gojek lunch"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>AMOUNT (IDR)</label>
            <input style={inputStyle} placeholder="0" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>DATE</label>
            <input style={inputStyle} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        {type === "expense" ? (
          <>
            <div>
              <label style={labelStyle}>GROUP</label>
              <select style={inputStyle} value={group} onChange={(e) => handleGroupChange(e.target.value)}>
                {GROUP_ORDER.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>CATEGORY</label>
              <select style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORY_GROUPS[group].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <div>
              <label style={labelStyle}>INCOME CATEGORY</label>
              <select style={inputStyle} value={incomeCategory} onChange={(e) => setIncomeCategory(e.target.value)}>
                {INCOME_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {incomeCategory === "Investment Withdrawal" && (
              <>
                <div>
                  <label style={labelStyle}>WITHDRAWING FROM</label>
                  <select style={inputStyle} value={investmentCategory} onChange={(e) => setInvestmentCategory(e.target.value)}>
                    {INVESTMENT_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setClosesPosition((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
                    borderRadius: 12, border: "1.5px solid var(--line)", background: closesPosition ? "var(--paper)" : "var(--white)",
                    cursor: "pointer", textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                      border: "1.5px solid var(--ink)", background: closesPosition ? "var(--blue)" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}
                  >
                    {closesPosition && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>This closes out the position</div>
                    <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, marginTop: 1 }}>
                      Nothing left invested here — any gap to the tracked balance is logged as a realized gain or loss.
                    </div>
                  </div>
                </button>
              </>
            )}
          </>
        )}

        <div>
          <label style={labelStyle}>FUND SOURCE</label>
          <select style={inputStyle} value={source} onChange={(e) => setSource(e.target.value)}>
            {SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {error && <div style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 700 }}>{error}</div>}

        <button
          onClick={submit}
          style={{
            marginTop: 4, padding: "15px 0", borderRadius: 14, border: "none", cursor: "pointer",
            background: "var(--blue)", color: "var(--white)", fontWeight: 700, fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}
        >
          <IconPlus /> Add {type === "income" ? "income" : "expense"}
        </button>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------
   DATA TAB — EXPORT / IMPORT
--------------------------------------------------------- */

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function DataTab({ transactions, onImport, showToast }) {
  const fileInputRef = useRef(null);
  const [pending, setPending] = useState(null); // { entries, filename }
  const [parseError, setParseError] = useState("");

  const handleExport = () => {
    const stamp = todayISO();
    downloadJSON(transactions, `daily-budgeting-backup-${stamp}.json`);
    showToast("Backup downloaded");
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setParseError("");
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!Array.isArray(parsed)) throw new Error("not an array");
        const valid = parsed.filter((t) => t && t.id && t.date && t.name != null && typeof t.amount === "number");
        if (valid.length === 0) throw new Error("no valid entries");
        setPending({ entries: valid, filename: file.name });
      } catch (err) {
        setParseError("Couldn't read that file — make sure it's a backup exported from this app.");
        setPending(null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = async (mode) => {
    if (!pending) return;
    await onImport(pending.entries, mode);
    setPending(null);
  };

  const cardStyle = { display: "flex", flexDirection: "column", gap: 12 };
  const btnPrimary = {
    padding: "14px 0", borderRadius: 14, border: "none", cursor: "pointer",
    background: "var(--blue)", color: "var(--white)", fontWeight: 700, fontSize: 14.5,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  };
  const btnOutline = {
    padding: "12px 0", borderRadius: 14, border: "1.5px solid var(--ink)", cursor: "pointer",
    background: "transparent", color: "var(--ink)", fontWeight: 700, fontSize: 13.5,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
      <Card style={cardStyle}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Export your data</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5 }}>
            Downloads all {transactions.length} entries as a single file. Use this to move your data to
            another device, or just to keep a backup.
          </div>
        </div>
        <button onClick={handleExport} style={btnPrimary}>
          Download backup (.json)
        </button>
      </Card>

      <Card style={cardStyle}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Import data</div>
          <div style={{ fontSize: 12.5, color: "var(--muted)", fontWeight: 600, lineHeight: 1.5 }}>
            Pick a backup file exported from this app on another device.
          </div>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} style={{ display: "none" }} />
        <button onClick={() => fileInputRef.current && fileInputRef.current.click()} style={btnOutline}>
          Choose file…
        </button>
        {parseError && <div style={{ color: "var(--red)", fontSize: 12.5, fontWeight: 700 }}>{parseError}</div>}
      </Card>

      {pending && (
        <Card tone="ink" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{pending.entries.length} entries found</div>
            <div style={{ fontSize: 12.5, opacity: 0.75, fontWeight: 600, lineHeight: 1.5 }}>
              From "{pending.filename}". Merge adds only entries you don't already have. Replace wipes
              everything currently on this device first.
            </div>
          </div>
          <button onClick={() => confirmImport("merge")} style={{ ...btnPrimary, background: "var(--lime)", color: "var(--ink)" }}>
            Merge with existing data
          </button>
          <button
            onClick={() => confirmImport("replace")}
            style={{ ...btnOutline, borderColor: "rgba(255,255,255,0.4)", color: "var(--white)" }}
          >
            Replace everything instead
          </button>
          <button onClick={() => setPending(null)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
            Cancel
          </button>
        </Card>
      )}

      <div style={{ fontSize: 11.5, color: "var(--muted)", fontWeight: 600, padding: "0 4px", lineHeight: 1.6 }}>
        Your data lives only on this device's browser storage. Exporting regularly is the safest way to
        keep a copy — clearing your browser's site data would otherwise erase everything with no way to
        recover it.
      </div>
    </div>
  );
}
