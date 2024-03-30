const rowTemplate = $("#productRow").clone()
const inventoriesTemplate = rowTemplate.find("#inventoryBlock").clone()
const inventoryRowTemplate = inventoriesTemplate.find("#inventoryRow")
const paginateTemplate = $("#paginationNav")
let locationList = []
let url_params = new URLSearchParams(document.location.search)

$(document).ready(function () {
    $("#productRow").remove()
    $("#createProductBtn").click(createProduct)
    $("#addLocationBtn").click(createLocation)
    $("#createInventoryBtn").click(createInventory)

    $(document).on('click', "#toggleCreateInventoryFormBtn", showCreateInventoryForm)
    $(document).on('click', "#inventoryDeleteBtn", deleteInventory)
    $(document).on('input', "textarea.autosize", function () {
        this.style.height = (this.scrollHeight - 4) + 'px'
    })
    updateTable()
    updateLocationList()
})


function updateLocationList() {
    getLocationsApi().then(function (data) {
        locationList = data
    })
}

function formToDict(form) {
    let data = {}
    form.serializeArray().forEach(elem => {
        data[elem['name']] = elem['value']
    })
    return data
}

function updateTable() {
    getProductsApi()
        .then(function (data) {
            let table = $("#productsTableBody")
            let pagination = $("#paginationNav")
            data.products.forEach(product => table.append(renderProductRow(product)))
            pagination.replaceWith(renderPagination(data.paginate))
        })
}

function updateLocationSelectorOptions(selector, product) {
    let locationIds = new Set()
    for (let inv of product.inventories) locationIds.add(inv.location.id)

    selector.empty()
    locationList.forEach(location => {
        if (!(locationIds.has(location.id))) {
            selector.append(`<option value=${location.id}>${location.name}</option>`)
        }
    })
}

// Обработчики событий

function createLocation() {
    let form = $("#createLocationForm")
    let data = formToDict(form)

    createLocationApi(data).then(function (data) {
        $("#createLocationModal").modal("toggle")
        updateLocationList()
    })
}

function createProduct() {
    let form = $("#createProductForm")
    let data = formToDict(form)

    createProductApi(data).then(function (data) {
        $("#createProductModal").modal("toggle")
        updateTable()
    })
}

function deleteInventory() {
    let id = $(this).data("id")
    deleteInventoryApi(id).then(
        $("#inventoryRow-" + id).remove()
    )
}

function createInventory() {
    let form = $("#createInventoryForm")
    let data = formToDict(form)
    createInventoryApi(data).then(
        function (data) {
            $("#createInventoryModal").modal("hide")
            let list = $("#inventoriesList-" + data.product_id)
            console.log(list)
            list.append(renderInventoryRow(data))
        })
}

function showCreateInventoryForm() {
    let product = $(this).data("product")
    let target = $("#createInventoryModal")
    let selector = target.find("select")

    updateLocationSelectorOptions(selector, product)
    target.find("#ProductIdField").prop("value", product.id)
    target.find(".product-name").text(product.name)
    target.find("#QuantityField").val("")

    target.modal("show")
}

// Функции рендеринга элементов
function setPageValue(container, id, value) {
    let temp_url_params = new URLSearchParams(url_params)
    let elem = container.find(`#${id}`)
    temp_url_params.set("page", value)
    elem.find("a.page-link").prop("href", "?" + temp_url_params.toString())
    elem.find("a.value").text(value)
}


function renderPagination(paginate) {
    let pagination = paginateTemplate.clone()

    setPageValue(pagination, "currentPageItem", paginate.page)

    if (paginate.has_prev) {
        setPageValue(pagination, "firstPageItem", 1)
        setPageValue(pagination, "prevPageItem", paginate.page - 1)
        setPageValue(pagination, "prevPageValueItem", paginate.page - 1)
    } else {
        pagination.find("#prevPageItem").addClass("disabled")
        pagination.find("#prevPageValueItem").remove()
        pagination.find("#prevPageSeparator").remove()
        pagination.find("#firstPageItem").remove()
    }

    if (paginate.has_next) {
        setPageValue(pagination, "nextPageValueItem", paginate.page + 1)
        setPageValue(pagination, "nextPageItem", paginate.page + 1)
        setPageValue(pagination, "lastPageItem", paginate.pages)
    } else {
        pagination.find("#nextPageItem").addClass("disabled")
        pagination.find("#nextPageValueItem").remove()
        pagination.find("#nextPageSeparator").remove()
        pagination.find("#lastPageItem").remove()
    }
    return pagination
}


function renderProductRow(product) {
    let row = rowTemplate.clone()

    row.prop("id", "productRow-" + product.id)
    row.find("#nameValue").text(product.name)
    row.find("#descriptionValue").text(product.description)
    row.find("#priceValue").text(product.price)
    row.find("#inventoryBlock").replaceWith(renderInventoriesBlock(product))
    return row
}

function renderInventoriesBlock(product) {
    let block = inventoriesTemplate.clone()
    let list = block.find("#inventoriesList")
    let button = block.find("#toggleCreateInventoryFormBtn")

    button.data("product", product)
    block.prop("id", "inventoryBlock-" + product.id)
    list.prop("id", "inventoriesList-" + product.id)

    list.empty()
    product.inventories.forEach(inventory => {
        list.append(renderInventoryRow(inventory))
    })

    return block
}

function renderInventoryRow(inventory) {
    let row = inventoryRowTemplate.clone()
    row.find("#inventoryDeleteBtn").data("id", inventory.id)
    row.find("#locationValue").text(inventory.location.name)
    row.find("#quantityValue").text(inventory.quantity)
    row.prop("id", "inventoryRow-" + inventory.id)
    return row
}

// API-запросы

function getProductsApi() {
    return new Promise(function (resolve, reject) {
        $.getJSON({
            url: "/api/products" + document.location.search,
            success: function (...args) {
                console.log("Список товаров получен успешно")
                resolve(...args)
            },
            error: function (...args) {
                console.log("Возникли проблемы с получением списка товаров")
                reject(...args)
            }
        })
    })
}

function createProductApi(data) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: "/api/products",
            headers: {"Content-Type": "application/json"},
            method: "post",
            data: JSON.stringify(data),
            success: function (...args) {
                console.log("Запрос на создание товара выполнен успешно")
                resolve(...args)
            },
            error: function (...args) {
                console.log("Ошибка при запросе на создание товара")
                reject(error)
            }
        })
    })
}

function createLocationApi(data) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: "/api/locations",
            headers: {"Content-Type": "application/json"},
            method: "post",
            data: JSON.stringify(data),
            success: function (...args) {
                console.log("Запрос на создание склада выполнен успешно")
                resolve(...args)
            },
            error: function (...args) {
                console.log("Возникли проблемы при запросе на создание товара")
                reject(...args)
            }
        })
    })
}

function getLocationsApi() {
    return new Promise(function (resolve, reject) {
        $.getJSON({
            url: "/api/locations",
            success: function (...args) {
                console.log("Список складов получен")
                resolve(...args)
            },
            error: function (...args) {
                console.log("Возникли проблемы с получением списка складов")
                reject(...args)
            }
        })
    })
}

function createInventoryApi(data) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: "/api/inventories",
            method: "post",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data),
            success: function (data) {
                console.log("Запрос на добавление товара на склад выполнен успешно")
                resolve(data)
            },
            error: function (...args) {
                console.log("Произошла ошибка при запросе на добавление товара на склад")
                reject(...args)
            }
        })
    })
}

function deleteInventoryApi(id) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url: `/api/inventory/${id}`,
            headers: {"Content-Type": "application/json"},
            method: "delete",
            success: function (...args) {
                console.log("Запрос на удаление товара со склада выполнен успшно")
                resolve(...args)
            },
            error: function (...args) {
                console.log("Произошла ошибка при удалении товара со склада")
                reject(...args)
            }
        })
    })
}
