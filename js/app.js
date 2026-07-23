let customers = [];
function showPage(page){


let pages=[
"dashboard",
"customers",
"products"
];


pages.forEach(p=>{

let el=document.getElementById(p);

if(el)
el.style.display="none";

});


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
let products=[];



function addProduct(){


let name =
document.getElementById("productName").value;


let category =
document.getElementById("productCategory").value;


let price =
document.getElementById("productPrice").value;



if(!name || !price){

alert("Enter product details");
return;

}



products.push({

id:Date.now(),

name:name,

category:category,

price:Number(price)

});


displayProducts();



document.getElementById("productName").value="";
document.getElementById("productCategory").value="";
document.getElementById("productPrice").value="";


}



function displayProducts(){


let table =
document.getElementById("productTable");


table.innerHTML="";



products.forEach(p=>{


table.innerHTML += `

<tr>

<td>${p.name}</td>

<td>${p.category}</td>

<td>₹${p.price}</td>

<td>

<button 
class="btn btn-danger btn-sm"
onclick="deleteProduct(${p.id})">

Delete

</button>

</td>


</tr>

`;


});


}



function deleteProduct(id){


products =
products.filter(p=>p.id!==id);


displayProducts();


}
