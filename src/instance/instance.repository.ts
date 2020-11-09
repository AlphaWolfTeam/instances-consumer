import ISchema from "../utils/schema.interface";
import IProperty from "../utils/property.interface";
import { DBConnection } from "../utils/dbConnection";
import { ObjectId } from "mongodb";
import { ValidationError } from "../utils/errors/user";

interface DBOpsResult {
  ok: number;
  n: number;
  nModified: number;
}

export class InstanceRepository {
  /**
   * Creates a new schema and index properties.
   * Returns the new collection.
   * @param schema the new schema to be implemented as a collection.
   */
  public static async createCollection(schema: ISchema) {
    const collection = await DBConnection.dbClient
      .db(DBConnection.dbName)
      .createCollection(schema.schemaName);
    const indexAndUniqueProps = schema.schemaProperties.filter(
      (prop) => prop.isUnique || prop.index
    );

    // Index properties in the created schema
    await Promise.all(
      indexAndUniqueProps.map(
        async (prop) => await collection.createIndex(prop.propertyName)
      )
    );

    return collection;
  }

  /**
   * Updates all the properties in a collection by the difference between the two schemas.
   * @param prevSchema the old schema to change.
   * @param newSchema the new schema to update in the db.
   */
  public static async updateCollection(
    prevSchema: ISchema,
    newSchema: ISchema
  ): Promise<DBOpsResult> {
    // An inner function protocol for storing data about changed properties.
    interface ChangedProp {
      propertyName: string;
      shouldBeIndexed?: boolean;
      shouldBeUnindexed?: boolean;
      changedType?: string;
      isDeleted?: boolean;
    }

    /**
     * The function accepts two schemas and returns the changed
     * properties between the two schemas as ChangedProp.
     * @param prevSchema the schema before changing.
     * @param newSchema the updated schema.
     */
    function getChangedProperties(
      prevSchema: ISchema,
      newSchema: ISchema
    ): [ChangedProp] {
      return prevSchema.schemaProperties
        .map((prevSchemaProp: IProperty): ChangedProp | undefined => {
          const newSchemaProp = newSchema.schemaProperties.find(
            (newSchemaProp) =>
              newSchemaProp.propertyName === prevSchemaProp.propertyName
          );
          const arePropsEqual =
            Object.entries(prevSchemaProp).toString() ===
            Object.entries(newSchemaProp || {}).toString();
          if (!newSchemaProp) {
            return {
              propertyName: prevSchemaProp.propertyName,
              isDeleted: true,
            };
          } else if (!arePropsEqual) {
            const shouldBeIndexed =
              !(prevSchemaProp.index || prevSchemaProp.isUnique) &&
              (newSchemaProp.index || newSchemaProp.isUnique);
            const shouldBeUnindexed =
              (prevSchemaProp.index || prevSchemaProp.isUnique) &&
              !(newSchemaProp.index || newSchemaProp.isUnique);
            const changedType =
              prevSchemaProp.propertyType !== newSchemaProp.propertyType
                ? newSchemaProp.propertyType
                : undefined;

            return {
              propertyName: prevSchemaProp.propertyName,
              shouldBeIndexed,
              shouldBeUnindexed,
              changedType,
            };
          }
          return undefined;
        })
        .filter(Boolean) as [ChangedProp];
    }

    /**
     * A factory that converts an item to type of "type".
     * Returns the converted item or ValidationError.
     * @param item the item to convert.
     * @param type the type to convert to.
     */
    function convertFactory(item: any, type: string) {
      try {
        switch (type) {
          case "String":
            return new String(item);
          case "Number":
            return new Number(item);
          case "Boolean":
            return new Boolean(item);
          case "Date":
            return new Date(item);
          case "ObjectId":
            return new ObjectId(item);
          default:
            throw new ValidationError();
        }
      } catch (e) {
        throw new ValidationError();
      }
    }

    const changedProperties = getChangedProperties(prevSchema, newSchema);

    const collection = DBConnection.dbClient
      .db(DBConnection.dbName)
      .collection(prevSchema.schemaName);

    const dbOpsResultsArr = await Promise.all(
      changedProperties.map(async (changedProp: ChangedProp) => {
        if (changedProp.shouldBeIndexed) {
          // In case the prop should be indexed
          return await collection.createIndex(changedProp.propertyName);
        } else if (changedProp.shouldBeUnindexed) {
          // In case the prop should be unindexed
          return await collection.dropIndex(changedProp.propertyName);
        } else if (changedProp.isDeleted) {
          // In case the prop should be deleted
          return await this.deleteProperty(
            prevSchema.schemaName,
            changedProp.propertyName
          );
        } else if (changedProp.changedType) {
          // In case the prop should be in a different type.
          // The current best way for type conversion is to get
          // all documents and convert them individualy.
          const condWherePropExists: any = {};
          condWherePropExists[changedProp.propertyName] = {
            $exists: true,
          };
          const instancesToConvert = await collection
            .find(condWherePropExists)
            .toArray();

          return await Promise.all(
            instancesToConvert.map(
              async (instance: any): Promise<DBOpsResult> => {
                const newInstance = { ...instance };
                try {
                  newInstance[changedProp.propertyName] = convertFactory(
                    newInstance[changedProp.propertyName],
                    "" + changedProp.changedType
                  );
                } catch (e) {
                  return { ok: 0, n: 0, nModified: 0 };
                }
                return (
                  await collection.updateOne({ _id: instance._id }, newInstance)
                ).result;
              }
            )
          );
        }
      })
    );

    // A function for summing all the results of the db ops (using the Array.prototype.reduce function)
    function sumResultsReducer(
      previousValue: DBOpsResult,
      currentValue: DBOpsResult
    ): DBOpsResult {
      return {
        ok: previousValue.ok + currentValue.ok,
        n: previousValue.n + currentValue.n,
        nModified: previousValue.nModified + currentValue.nModified,
      };
    }

    // Sum of all db ops results
    const dbOpsResult = dbOpsResultsArr.reduce(sumResultsReducer);
    return dbOpsResult;
  }

  /**
   * Deletes a collection in the db.
   * @param schemaName the collection name
   */
  public static async deleteCollection(schemaName: string) {
    return DBConnection.dbClient
      .db(DBConnection.dbName)
      .dropCollection(schemaName);
  }

  /**
   * Deletes a property of a given collection.
   * Returns the how well this action worked.
   * @param schemaName the name of the collection
   * @param propertyName the name of the property to delete
   */
  public static async deleteProperty(
    schemaName: string,
    propertyName: string
  ): Promise<DBOpsResult> {
    const deletePropQuery: any = { $unset: {} };
    deletePropQuery[propertyName] = "";

    return (
      await DBConnection.dbClient
        .db(DBConnection.dbName)
        .collection(schemaName)
        .updateMany({}, deletePropQuery)
    ).result;
  }
}
