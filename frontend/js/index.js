

let locationList = []

$(document).ready(function () {
    $("textarea.autosize").on('input', function () {
        this.style.height = (this.scrollHeight - 4) + 'px'
    })
    $("#addProductBtn").click(createProduct)
    $("#addLocationBtn").click(createLocation)
    $("#searchButton").click(searchProducts)
    $("#productsTableHeader th.sortable").click(orderProducts)
    getProducts()
    getLocations()
})

function orderProducts() {
    let column = $(this).data("column")
    let order = $(this).data("order")
    console.log(order)

    order = order === "asc" ? "desc" : "asc"
    $(this).data("order", order)

    $('#productsTableHeader .orderDirection').text("")

    $(this).find("div.orderDirection").text(order === "asc" ? "↑" : "↓")

    getProducts([column, order])
}

function searchProducts() {
    let form = $('#searchForm')
    console.log(form.serialize())
    getProducts(form.serialize())

}

function collapseAddLocationForm() {
    let target = $($(this).data("target"))
    let selectField = target.find('select')
    if (target.hasClass('show')) {
        selectField.empty()
    } else {
        locationList.forEach(location => {
            selectField.append($(`<option value="${location['id']}">${location['name']}</option>`))
        })
    }

    target.collapse('toggle')
}

function renderInventoryRow(inventory) {
    let containerId = `container-inventory-${inventory.id}`
    let deleteLocationBtn = $(`<input type="button" class="btn-sm btn-outline-danger py-0" value="-" data-inventory-id="${inventory.id}">`)
    let collapseBtn = $(`<input type="button" class="btn-sm btn-outline-primary py-0" value="V" data-bs-toggle="collapse" data-bs-target="#${containerId} .target" data-inventory-id="${inventory.id}">`)
    let submitBtn = $(`<input type="button" class="btn btn-xs btn-outline-primary p-0 col-4" data-inventory-id="${inventory.id}" value="Ок">`)
    let row = $(`<div id="inventoryRow-${inventory.id}" class="row"></div>`)

    deleteLocationBtn.click(deleteInventory)
    submitBtn.click(updateInventory)

    row.append(
        $('<div class="col-1"></div>').append(deleteLocationBtn),
        $('<div class="col-7"></div>').text(inventory.location.name),
        $(`<div id="${containerId}" class="col-4 row"></div>`).append(
            $(`<div class="row"></div>`).append(
                $(`<div id="quantityValue-${inventory.id}"class="col-8"></div>`).text(inventory.quantity),
                $('<div class="col-2"></div>').append(collapseBtn),
            ),
            $('<div class="target row collapse mt-2"></div>').append(
                $(`<form id="inventoryForm-${inventory.id}" class="input-group row p-0"></form>`).append(
                    $(`<input class="col-3 form-control p-0" type="number" name="quantity">`),
                    submitBtn,
                ),
            )
        )
    )
    return row
}

function renderAddLocationForm(product) {
    let form = $(`<form id=addLocationForm-${product.id} class="collapse row m-2">`)
    form.append(
        $('<div class="col-7 px-1"></div>').append(
            $(`<select class="form-select" name="location_id"></select>`)
        ),
        $('<div class="col-3 px-1"></div>').append(
            $(`<input type="number" name="quantity" class="form-control" value="0">`),
        ),
        $('<div class="col-2 px-2 pt-1"></div>').append(
            $(`<input type="button" class="btn btn-sm btn-outline-primary" data-product-id="${product.id}" value="Ок">`).click(createInventory)
        )
    )
    return form
}

function renderInventoriesCard(product) {
    let inventoriesContainer = $(`<div id="inventoriesCard-${product.id}"></div>`)
    let inventoriesList = $(`<div id="inventoriesList-${product.id}"></div>`)
    product.inventories.forEach(inventory => {
        inventoriesList.append(renderInventoryRow(inventory))
    })
    inventoriesContainer.append(inventoriesList)
    inventoriesContainer.append(renderAddLocationForm(product))
    inventoriesContainer.append(
        $(`<div class="row m-2">`).append(
            $(`<input type="button" class="btn btn-sm btn-outline-primary" data-target="#addLocationForm-${product.id}" value="+">`).click(collapseAddLocationForm)
        )
    )
    return inventoriesContainer
}

function renderProductCard(product) {
    let productContainer = $('<div class="row row-cols-5">')
    productContainer.append(
        $('<td class="col-2 col-lg-2 text"></td>').text(product.name),
        $('<td class="col-4 col-lg-4"></td>').text(product.description),
        $('<td class="col-1 col-lg-1"></td>').text(product.price),
        $('<td class="col-5 col-lg-5"></td>').append(renderInventoriesCard(product))
    )
    return productContainer
}

function renderProductsTable(data) {
    let tableBody = $('#products-table-body')
    tableBody.empty()
    if (!data.length) {
        tableBody.append($('<div class="text-center"></div>').text("товары не найдены"))
        return
    }
    data.forEach(product => tableBody.append(renderProductCard(product)))
}

function formToDict(form) {
    let data = {}
    form.serializeArray().forEach(elem => {
        data[elem['name']] = elem['value']
    })
    return data
}


function getProducts(ordering) {
    let params = document.location.search
    let order_params = ordering ? `column=${ordering[0]}&order=${ordering[1]}` : ""
    params += (params && order_params) ? "&" : (order_params) ? "?" : ""
    params += order_params

    $.getJSON({
        url: '/api/products' + params,
        success: function (data) {
            renderProductsTable(data)
        }
    })
}

function createProduct() {
    let form = $("#addProductForm")
    let data = formToDict(form)

    $.ajax({
        url: "/api/products",
        headers: {"Content-Type": "application/json"},
        method: "post",
        data: JSON.stringify(data),
        success: function (response) {
            console.log(`Product ${response.id} created`)
            $("#addProductModal").modal('hide')
        },
    })
}

function deleteInventory() {
    let inventoryId = $(this).data("inventory-id")
    $.ajax({
        url: `/api/inventory/${inventoryId}`,
        headers: {"Content-Type": "application/json"},
        method: "delete",
        data: JSON.stringify(),
        context: $(this),
        success: function (data) {
            $('#inventoryRow-' + inventoryId).remove()
        },
    })
}

function updateInventory() {
    let inventoryId = $(this).data("inventory-id")
    let form = $('#inventoryForm-' + inventoryId)
    data = formToDict(form)

    $.ajax({
        url: `/api/inventory/${inventoryId}`,
        headers: {"Content-Type": "application/json"},
        method: "patch",
        data: JSON.stringify(data),
        context: $(this),
        success: function (response) {
            console.log(`Inventory ${inventoryId} updated`)
            $("#quantityValue-" + inventoryId)[0].innerText = response["quantity"]
        },
    })
}

function createInventory() {
    let productId = $(this).data("product-id")
    let form = $('#addLocationForm-' + productId)

    data = formToDict(form)
    data['product_id'] = productId

    $.ajax({
        url: `/api/inventory/`,
        headers: {"Content-Type": "application/json"},
        method: "post",
        data: JSON.stringify(data),
        success: function (response) {
            console.log(`Inventory ${response.id} created`)
            $('#inventoriesList-' + response.product_id).append(renderInventoryRow(response))
            form.collapse("toggle")
        },
    })
}

function getLocations() {
    $.getJSON({
        url: '/api/locations',
        success: function (response) {
            locationList = response
        }
    })
}

function createLocation() {
    let form = $("#addLocationForm")
    let data = formToDict(form)

    $.ajax({
        url: "/api/locations",
        headers: {"Content-Type": "application/json"},
        method: "post",
        data: JSON.stringify(data),
        success: function (response) {
            console.log("Location created")
            $("#addLocationModal").modal('hide')
            getLocations()
        },
    })
}
