let customers = [];
function showPage(page){

    document.getElementById("dashboard").style.display="none";
    document.getElementById("customers").style.display="none";

    document.getElementById(page).style.display="block";

}



function uploadExcel(){

    let file =
    document.getElementById("excelFile").files[0];


    if(!file){
        alert("Select Excel file");
        return;
    }


    let reader = new FileReader();


    reader.onload=function(e){

        let data =
        new Uint8Array(e.target.result);


        let workbook =
        XLSX.read(data,{type:"array"});


        let sheet =
        workbook.Sheets[workbook.SheetNames[0]];


        customers =
        XLSX.utils.sheet_to_json(sheet);


        displayCustomers();

    };


    reader.readAsArrayBuffer(file);

}



function displayCustomers(){

    let table =
    document.getElementById("customerTable");


    table.innerHTML="";


    customers.forEach(c=>{


        table.innerHTML += `

        <tr>

        <td>${c.Name || ""}</td>

        <td>${c.Designation  || ""}</td>

        <td>${c.Department || ""}</td>
        <td>${c.City || ""}</td>
        <td>${c.phone || ""}</td>

        </tr>

        `;


    });


    document.getElementById("customerCount").innerText = customers.length;

}
