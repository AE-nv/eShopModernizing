using System.ComponentModel.DataAnnotations;

namespace CatalogAdmin.Api;

public sealed class CatalogStore
{
    private readonly object gate = new();
    private readonly List<CatalogBrandRecord> brands =
    [
        new(1, "Azure"),
        new(2, ".NET"),
        new(3, "Visual Studio"),
        new(4, "SQL Server"),
        new(5, "Other")
    ];

    private readonly List<CatalogTypeRecord> types =
    [
        new(1, "Mug"),
        new(2, "T-Shirt"),
        new(3, "Sheet"),
        new(4, "USB Memory Stick")
    ];

    private readonly List<CatalogItemRecord> items =
    [
        new() { Id = 1, CatalogTypeId = 2, CatalogBrandId = 2, AvailableStock = 100, Description = ".NET Bot Black Hoodie", Name = ".NET Bot Black Hoodie", Price = 19.5m, PictureFileName = "1.png" },
        new() { Id = 2, CatalogTypeId = 1, CatalogBrandId = 2, AvailableStock = 100, Description = ".NET Black & White Mug", Name = ".NET Black & White Mug", Price = 8.5m, PictureFileName = "2.png" },
        new() { Id = 3, CatalogTypeId = 2, CatalogBrandId = 5, AvailableStock = 100, Description = "Prism White T-Shirt", Name = "Prism White T-Shirt", Price = 12m, PictureFileName = "3.png" },
        new() { Id = 4, CatalogTypeId = 2, CatalogBrandId = 2, AvailableStock = 100, Description = ".NET Foundation T-shirt", Name = ".NET Foundation T-shirt", Price = 12m, PictureFileName = "4.png" },
        new() { Id = 5, CatalogTypeId = 3, CatalogBrandId = 5, AvailableStock = 100, Description = "Roslyn Red Sheet", Name = "Roslyn Red Sheet", Price = 8.5m, PictureFileName = "5.png" },
        new() { Id = 6, CatalogTypeId = 2, CatalogBrandId = 2, AvailableStock = 100, Description = ".NET Blue Hoodie", Name = ".NET Blue Hoodie", Price = 12m, PictureFileName = "6.png" },
        new() { Id = 7, CatalogTypeId = 2, CatalogBrandId = 5, AvailableStock = 100, Description = "Roslyn Red T-Shirt", Name = "Roslyn Red T-Shirt", Price = 12m, PictureFileName = "7.png" },
        new() { Id = 8, CatalogTypeId = 2, CatalogBrandId = 5, AvailableStock = 100, Description = "Kudu Purple Hoodie", Name = "Kudu Purple Hoodie", Price = 8.5m, PictureFileName = "8.png" },
        new() { Id = 9, CatalogTypeId = 1, CatalogBrandId = 5, AvailableStock = 100, Description = "Cup<T> White Mug", Name = "Cup<T> White Mug", Price = 12m, PictureFileName = "9.png" },
        new() { Id = 10, CatalogTypeId = 3, CatalogBrandId = 2, AvailableStock = 100, Description = ".NET Foundation Sheet", Name = ".NET Foundation Sheet", Price = 12m, PictureFileName = "10.png" },
        new() { Id = 11, CatalogTypeId = 3, CatalogBrandId = 2, AvailableStock = 100, Description = "Cup<T> Sheet", Name = "Cup<T> Sheet", Price = 8.5m, PictureFileName = "11.png" },
        new() { Id = 12, CatalogTypeId = 2, CatalogBrandId = 5, AvailableStock = 100, Description = "Prism White TShirt", Name = "Prism White TShirt", Price = 12m, PictureFileName = "12.png" }
    ];

    private int nextId = 13;

    public PaginatedCatalogItemsResponse GetCatalogItems(int pageIndex, int pageSize)
    {
        lock (gate)
        {
            var orderedItems = items.OrderBy(item => item.Id).ToList();
            var pageItems = orderedItems
                .Skip(pageIndex * pageSize)
                .Take(pageSize)
                .Select(MapListItem)
                .ToList();

            var totalCount = orderedItems.Count;
            var totalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize);

            return new PaginatedCatalogItemsResponse(pageIndex, pageSize, totalCount, totalPages, pageItems);
        }
    }

    public CatalogItemDetailsResponse? GetCatalogItem(int id)
    {
        lock (gate)
        {
            var item = items.FirstOrDefault(current => current.Id == id);
            return item is null ? null : MapDetails(item);
        }
    }

    public CatalogItemDetailsResponse CreateCatalogItem(CatalogItemRequest request)
    {
        lock (gate)
        {
            var item = new CatalogItemRecord
            {
                Id = nextId++,
                Name = request.Name.Trim(),
                Description = request.Description.Trim(),
                CatalogBrandId = request.CatalogBrandId,
                CatalogTypeId = request.CatalogTypeId,
                Price = request.Price,
                AvailableStock = request.AvailableStock,
                RestockThreshold = request.RestockThreshold,
                MaxStockThreshold = request.MaxStockThreshold,
                PictureFileName = CatalogItemRecord.DefaultPictureName
            };

            items.Add(item);
            return MapDetails(item);
        }
    }

    public CatalogItemDetailsResponse? UpdateCatalogItem(int id, CatalogItemRequest request)
    {
        lock (gate)
        {
            var item = items.FirstOrDefault(current => current.Id == id);
            if (item is null)
            {
                return null;
            }

            item.Name = request.Name.Trim();
            item.Description = request.Description.Trim();
            item.CatalogBrandId = request.CatalogBrandId;
            item.CatalogTypeId = request.CatalogTypeId;
            item.Price = request.Price;
            item.AvailableStock = request.AvailableStock;
            item.RestockThreshold = request.RestockThreshold;
            item.MaxStockThreshold = request.MaxStockThreshold;

            return MapDetails(item);
        }
    }

    public bool DeleteCatalogItem(int id)
    {
        lock (gate)
        {
            var item = items.FirstOrDefault(current => current.Id == id);
            return item is not null && items.Remove(item);
        }
    }

    public IReadOnlyList<LookupItemResponse> GetCatalogBrands() =>
        brands.Select(brand => new LookupItemResponse(brand.Id, brand.Name)).ToList();

    public IReadOnlyList<LookupItemResponse> GetCatalogTypes() =>
        types.Select(type => new LookupItemResponse(type.Id, type.Name)).ToList();

    public bool BrandExists(int brandId) => brands.Any(brand => brand.Id == brandId);

    public bool TypeExists(int typeId) => types.Any(type => type.Id == typeId);

    private CatalogListItemResponse MapListItem(CatalogItemRecord item)
    {
        var brandName = brands.First(brand => brand.Id == item.CatalogBrandId).Name;
        var typeName = types.First(type => type.Id == item.CatalogTypeId).Name;

        return new CatalogListItemResponse(
            item.Id,
            item.Name,
            item.Description,
            brandName,
            typeName,
            item.Price,
            item.PictureFileName,
            item.AvailableStock,
            item.RestockThreshold,
            item.MaxStockThreshold,
            item.PictureUri);
    }

    private CatalogItemDetailsResponse MapDetails(CatalogItemRecord item)
    {
        var brandName = brands.First(brand => brand.Id == item.CatalogBrandId).Name;
        var typeName = types.First(type => type.Id == item.CatalogTypeId).Name;

        return new CatalogItemDetailsResponse(
            item.Id,
            item.Name,
            item.Description,
            item.CatalogBrandId,
            brandName,
            item.CatalogTypeId,
            typeName,
            item.Price,
            item.PictureFileName,
            item.AvailableStock,
            item.RestockThreshold,
            item.MaxStockThreshold,
            item.PictureUri);
    }
}

public sealed class CatalogItemRequest : IValidatableObject
{
    [Required(AllowEmptyStrings = false)]
    public string Name { get; init; } = string.Empty;

    public string Description { get; init; } = string.Empty;

    [Range(1, int.MaxValue)]
    public int CatalogBrandId { get; init; }

    [Range(1, int.MaxValue)]
    public int CatalogTypeId { get; init; }

    public decimal Price { get; init; }

    [Range(0, int.MaxValue)]
    public int AvailableStock { get; init; }

    [Range(0, int.MaxValue)]
    public int RestockThreshold { get; init; }

    [Range(0, int.MaxValue)]
    public int MaxStockThreshold { get; init; }

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Price < 0)
        {
            yield return new ValidationResult(
                "The field Price must be a positive number with maximum two decimals.",
                [nameof(Price)]);
        }

        if (decimal.Round(Price, 2) != Price)
        {
            yield return new ValidationResult(
                "The field Price must be a positive number with maximum two decimals.",
                [nameof(Price)]);
        }
    }
}

public sealed record LookupItemResponse(int Id, string Name);

public sealed record PaginatedCatalogItemsResponse(
    int PageIndex,
    int PageSize,
    int TotalCount,
    int TotalPages,
    IReadOnlyList<CatalogListItemResponse> Items);

public sealed record CatalogListItemResponse(
    int Id,
    string Name,
    string Description,
    string Brand,
    string Type,
    decimal Price,
    string PictureFileName,
    int AvailableStock,
    int RestockThreshold,
    int MaxStockThreshold,
    string PictureUri);

public sealed record CatalogItemDetailsResponse(
    int Id,
    string Name,
    string Description,
    int CatalogBrandId,
    string Brand,
    int CatalogTypeId,
    string Type,
    decimal Price,
    string PictureFileName,
    int AvailableStock,
    int RestockThreshold,
    int MaxStockThreshold,
    string PictureUri);

public sealed record CatalogBrandRecord(int Id, string Name);

public sealed record CatalogTypeRecord(int Id, string Name);

public sealed class CatalogItemRecord
{
    public const string DefaultPictureName = "dummy.png";

    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int CatalogBrandId { get; set; }
    public int CatalogTypeId { get; set; }
    public decimal Price { get; set; }
    public string PictureFileName { get; set; } = DefaultPictureName;
    public int AvailableStock { get; set; }
    public int RestockThreshold { get; set; }
    public int MaxStockThreshold { get; set; }
    public string PictureUri => $"/Pics/{PictureFileName}";
}
