using System.ComponentModel.DataAnnotations;
using Microsoft.Extensions.FileProviders;
using CatalogAdmin.Api;

var builder = WebApplication.CreateBuilder(args);
var spaRoot = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "browser");

builder.Services.AddSingleton<CatalogStore>();

var app = builder.Build();

app.UseDefaultFiles(new DefaultFilesOptions
{
    FileProvider = new PhysicalFileProvider(spaRoot)
});
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(spaRoot)
});

app.MapGet("/api/catalog-items", (int? pageIndex, int? pageSize, CatalogStore store) =>
{
    var index = Math.Max(pageIndex ?? 0, 0);
    var size = Math.Max(pageSize ?? 10, 1);
    return Results.Ok(store.GetCatalogItems(index, size));
});

app.MapGet("/api/catalog-items/{id:int}", (int id, CatalogStore store) =>
{
    var item = store.GetCatalogItem(id);
    return item is null ? Results.NotFound() : Results.Ok(item);
});

app.MapPost("/api/catalog-items", (CatalogItemRequest request, CatalogStore store) =>
{
    var errors = ValidateRequest(request, store);
    if (errors.Count > 0)
    {
        return Results.ValidationProblem(errors);
    }

    var createdItem = store.CreateCatalogItem(request);
    return Results.Created($"/api/catalog-items/{createdItem.Id}", createdItem);
});

app.MapPut("/api/catalog-items/{id:int}", (int id, CatalogItemRequest request, CatalogStore store) =>
{
    var errors = ValidateRequest(request, store);
    if (errors.Count > 0)
    {
        return Results.ValidationProblem(errors);
    }

    var updatedItem = store.UpdateCatalogItem(id, request);
    return updatedItem is null ? Results.NotFound() : Results.Ok(updatedItem);
});

app.MapDelete("/api/catalog-items/{id:int}", (int id, CatalogStore store) =>
    store.DeleteCatalogItem(id) ? Results.NoContent() : Results.NotFound());

app.MapGet("/api/catalog-brands", (CatalogStore store) => Results.Ok(store.GetCatalogBrands()));
app.MapGet("/api/catalog-types", (CatalogStore store) => Results.Ok(store.GetCatalogTypes()));

app.MapFallbackToFile("index.html", new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(spaRoot)
});

app.Run();

static Dictionary<string, string[]> ValidateRequest(CatalogItemRequest request, CatalogStore store)
{
    var validationResults = new List<ValidationResult>();
    Validator.TryValidateObject(request, new ValidationContext(request), validationResults, true);

    if (!store.BrandExists(request.CatalogBrandId))
    {
        validationResults.Add(new ValidationResult("The Brand field is required.", [nameof(CatalogItemRequest.CatalogBrandId)]));
    }

    if (!store.TypeExists(request.CatalogTypeId))
    {
        validationResults.Add(new ValidationResult("The Type field is required.", [nameof(CatalogItemRequest.CatalogTypeId)]));
    }

    return validationResults
        .GroupBy(
            result => result.MemberNames.FirstOrDefault() ?? string.Empty,
            result => result.ErrorMessage ?? "Validation failed.")
        .ToDictionary(group => group.Key, group => group.Distinct().ToArray());
}
