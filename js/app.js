let customers = [];
function showPage(page){


let pages=[
"dashboard",
"customers",
"products",
"campaigns",
"orders",
"reports"
];


pages.forEach(p=>{

let el=document.getElementById(p);

if(el)
el.style.display="none";

});


document.getElementById(page).style.display="block";


if(page==="orders"){
    loadOrderProducts();
}


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
function previewMessage(){


let template =
document.getElementById("messageTemplate").value;


let table =
document.getElementById("messagePreview");


table.innerHTML="";



if(customers.length===0){

table.innerHTML=
`
<tr>
<td colspan="3">
No customers imported
</td>
</tr>
`;

return;

}



customers.forEach(c=>{


let msg =
template.replace(
"{{Name}}",
c.Name || ""
);



table.innerHTML +=
`

<tr>

<td>${c.Name || ""}</td>

<td>${c.Phone || c.Mobile || ""}</td>

<td>${msg}</td>

</tr>

`;



});


}
let cart=[];



function loadOrderProducts(){


let table =
document.getElementById("orderProductList");


if(!table) return;


table.innerHTML="";



products.forEach(p=>{


table.innerHTML += `

<tr>

<td>${p.name}</td>

<td>₹${p.price}</td>

<td>

<button 
class="btn btn-primary btn-sm"
onclick="addToCart(${p.id})">

Add

</button>

</td>

</tr>

`;

});


}




function addToCart(id){


let product =
products.find(p=>p.id===id);



let existing =
cart.find(c=>c.id===id);



if(existing){

existing.qty++;

}

else{


cart.push({

id:product.id,

name:product.name,

price:product.price,

qty:1


});


}


displayCart();


}



function displayCart(){


let table =
document.getElementById("cartList");


if(!table) return;


table.innerHTML="";


let total=0;



if(cart.length===0){

table.innerHTML=
`
<tr>
<td colspan="4">
Cart Empty
</td>
</tr>
`;

}



cart.forEach(item=>{


let amount =
item.price * item.qty;


total += amount;



table.innerHTML +=

`

<tr>

<td>${item.name}</td>

<td>

<input 
type="number"
value="${item.qty}"
min="1"
style="width:60px"
onchange="changeQty(${item.id},this.value)"
>

</td>


<td>
₹${amount}
</td>


<td>

<button
class="btn btn-danger btn-sm"
onclick="removeCart(${item.id})">

X

</button>


</td>


</tr>

`;

});


document.getElementById("cartTotal").innerText=total;


}




function changeQty(id,qty){


let item =
cart.find(c=>c.id===id);


item.qty =
Number(qty);


displayCart();


}




function removeCart(id){


cart =
cart.filter(c=>c.id!==id);


displayCart();


}



function checkout(){


if(cart.length===0){

alert("Cart empty");
return;

}


let total =
cart.reduce(
(sum,i)=>sum+(i.price*i.qty),
0
);



alert(
"Order Total ₹"+total
);


}
let orders=[];



function checkout(){


if(cart.length===0){

alert("Cart empty");
return;

}


let total =
cart.reduce(
(sum,item)=>sum+(item.price*item.qty),
0
);



let order={

id:"ORD-"+Date.now(),

date:new Date().toLocaleDateString(),

items:[...cart],

total:total,

status:"Pending"

};



orders.push(order);



generateInvoice(order);



cart=[];

displayCart();

displayOrders();


}




function generateInvoice(order){


let invoice=`

ORDER BILL

Order No:
${order.id}


Date:
${order.date}


----------------

`;


order.items.forEach(item=>{


invoice +=

`${item.name} x ${item.qty}
₹${item.price*item.qty}

`;

});


invoice +=
`
-----------------

TOTAL:
₹${order.total}

STATUS:
${order.status}

`;



alert(invoice);



}




function displayOrders(){


let table =
document.getElementById("orderHistory");


if(!table) return;


table.innerHTML="";



if(orders.length===0){

table.innerHTML=
`
<tr>
<td colspan="4">
No Orders
</td>
</tr>
`;

return;

}



orders.forEach(order=>{


table.innerHTML+=`

<tr>

<td>${order.id}</td>

<td>${order.date}</td>

<td>₹${order.total}</td>

<td>${order.status}</td>

</tr>

`;

});


}
