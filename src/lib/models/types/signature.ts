import * as assert from 'assert';
import { Type, TypeKind } from './abstract';
import type { SomeType } from './index';
import { TypeParameterType } from './type-parameter';
import { cloned, wrap } from './utils';
import { Serializer, BaseSerialized, Serialized } from '../../serialization';

/**
 * Type which describes a signature.
 *
 * ```ts
 * type T = () => string
 * type U = <A>(arg: A) => A
 * ```
 */
export class SignatureType extends Type {
    /** @inheritdoc */
    readonly kind = TypeKind.Signature;

    constructor(
        public typeParameters: TypeParameterType[],
        public parameters: SignatureParameterType[],
        public returnType: SomeType
    ) {
        super();
    }

    /** @inheritdoc */
    clone() {
        return new SignatureType(
            cloned(this.typeParameters),
            cloned(this.parameters),
            this.returnType.clone());
    }

    /** @inheritdoc */
    stringify(wrapped: boolean, useArrow = false): string {
        const typeParameters = this.typeParameters.map(String).join(', ');
        const parameters = this.parameters.map(String).join(', ');
        const returnIndicator = useArrow ? ': ' : ' => ';
        return wrap(wrapped, (typeParameters ? `<${typeParameters}>` : '') + `(${parameters})${returnIndicator}${this.returnType}`);
    }

    /** @inheritdoc */
    serialize(serializer: Serializer, init: BaseSerialized<SignatureType>): SerializedSignatureType {
        return {
            ...init,
            typeParameters: serializer.toObjects(this.typeParameters),
            parameters: serializer.toObjects(this.parameters),
            returnType: serializer.toObject(this.returnType)
        };
    }
}

export interface SerializedSignatureType extends Serialized<SignatureType, 'typeParameters' | 'parameters' | 'returnType'> {
}


/**
 * Type which describes a parameter of a signature.
 */
export class SignatureParameterType extends Type {
    /** @inheritdoc */
    readonly kind = TypeKind.SignatureParameter;

    constructor(
        public name: string,
        public isOptional: boolean,
        public isRest: boolean,
        public parameterType: SomeType
    ) {
        super();
    }

    /** @inheritdoc */
    clone() {
        return new SignatureParameterType(this.name, this.isOptional, this.isRest, this.parameterType.clone());
    }

    /** @inheritdoc */
    stringify(wrapped: boolean): string {
        assert(wrapped === false, 'SignatureParameterTypes may not be contained within other types.');

        return (this.isRest ? '...' : '')
            + this.name
            + (this.isOptional ? '?' : '')
            + ': '
            + this.parameterType;
    }

    /** @inheritdoc */
    serialize(serializer: Serializer, init: BaseSerialized<SignatureParameterType>): SerializedSignatureParameterType {
        return {
            ...init,
            name: this.name,
            isOptional: this.isOptional,
            isRest: this.isRest,
            parameterType: serializer.toObject(this.parameterType)
        };
    }
}

export interface SerializedSignatureParameterType extends Serialized<SignatureParameterType, 'name' | 'isOptional' | 'isRest' | 'parameterType'> {
}