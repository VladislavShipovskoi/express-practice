# Express sandbox environment

This repository serves as a dedicated sandbox for learning and exploring the diverse ecosystem of express framework.

## Запрос(ы) для вставки данных минимум о двух книгах в коллекцию books:

```sh
db.books.insertMany([
    {
        _id: 0,
        title: "string1",
        description: "string1",
        authors: "string1"
    },
    {
        _id: 1,
        title: "string2",
        description: "string2",
        authors: "string2"
    }
])
```

## Запрос для поиска полей документов коллекции books по полю title,

```sh
db.books.find(
    { title: "string1"}
)
```

## Запрос для редактирования полей: description и authors коллекции books по \_id записи.

```sh
db.books.updateOne(
    { _id: 1 },
    {
        $set: {
          description: "new dwsc",
          authors: "new auth"
        }
    }
)
```
