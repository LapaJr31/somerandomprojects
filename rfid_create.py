import sys
import secrets
import csv
import openpyxl
import datetime


generate = True
format_to_generate = "excel"

#missing arguments
if len(sys.argv)<3:
    generate = False
    print("Usage: python " + sys.argv[0] + " CC OEM [quantity] (quantity is 20 if omitted)")
else:
    #country code longer than 2 letters or not a string
    if len(sys.argv[1]) > 2 or not isinstance(sys.argv[1], str):
        generate = False
        print("Usage: python " + sys.argv[0] + " CC OEM [quantity] (quantity is 20 if omitted)")
        print("Country code / CC must me 2 letters")
    else:
        country_code = sys.argv[1]
        oem = sys.argv[2]

quantity = 20
if len(sys.argv)>3:
    quantity = int(sys.argv[3])
    
#We got right parameters, generate values:
if generate:
    date_string = datetime.datetime.today().strftime('%d.%m.%Y')
    if format_to_generate == "csv":
        filename = oem + "_" + country_code + "_RFIDs_" + date_string + ".csv"
        csv_file = open(filename, mode ='w', newline="")
        csv_writer = csv.writer(csv_file, delimiter=';')
    if format_to_generate == "excel":
        filename = oem + "_" + country_code + "_RFIDs_" + date_string + ".xlsx"
        excel_wb = openpyxl.Workbook()
        excel_sheet = excel_wb.active
        
    print("Generating " + str(quantity) + " RFID values:")
    for i in range(0, quantity):
        card = secrets.token_hex(4)
        card = card[:8]
        card = country_code + "-FB-S-" + card + "-" + str(i%10)
        uuid = secrets.token_hex(7)
        uuid = uuid[:14]
        
        if format_to_generate == "csv":
            csv_writer.writerow([card,uuid])
        if format_to_generate == "excel":
            cell_name = "A" + str(i+1)
            excel_sheet[cell_name] = card.upper()
            cell_name = "B" + str(i+1)
            excel_sheet[cell_name] = uuid.upper()
            cell_name = "C" + str(i+1)
            excel_sheet[cell_name] = "ACDC"
            cell_name = "D" + str(i+1)
            excel_sheet[cell_name] = "Yes"
            
    if format_to_generate == "excel":
        excel_wb.save(filename)
    print("Generation successful, results stored in " + filename)