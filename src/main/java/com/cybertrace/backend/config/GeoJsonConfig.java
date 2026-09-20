package com.cybertrace.backend.config;

import java.io.IOException;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.LineString;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.Polygon;
import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.fasterxml.jackson.databind.module.SimpleModule;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

@Configuration
public class GeoJsonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer geoJsonCustomizer() {
        return builder -> {
            SimpleModule geoModule = new SimpleModule("GeoJsonModule");
            geoModule.addSerializer(Point.class, new PointSerializer());
            geoModule.addSerializer(Polygon.class, new PolygonSerializer());
            builder.modulesToInstall(new JavaTimeModule(), geoModule);
            builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        };
    }

    public static class PointSerializer extends JsonSerializer<Point> {
        @Override
        public void serialize(Point point, JsonGenerator gen, SerializerProvider serializers) throws IOException {
            if (point == null) {
                gen.writeNull();
                return;
            }
            gen.writeStartObject();
            gen.writeStringField("type", "Point");
            gen.writeArrayFieldStart("coordinates");
            gen.writeNumber(point.getX());
            gen.writeNumber(point.getY());
            gen.writeEndArray();
            gen.writeEndObject();
        }
    }

    public static class PolygonSerializer extends JsonSerializer<Polygon> {
        @Override
        public void serialize(Polygon polygon, JsonGenerator gen, SerializerProvider serializers) throws IOException {
            if (polygon == null) {
                gen.writeNull();
                return;
            }
            gen.writeStartObject();
            gen.writeStringField("type", "Polygon");
            gen.writeArrayFieldStart("coordinates");

            LineString exteriorRing = polygon.getExteriorRing();
            gen.writeStartArray();
            for (Coordinate c : exteriorRing.getCoordinates()) {
                gen.writeStartArray();
                gen.writeNumber(c.getX());
                gen.writeNumber(c.getY());
                gen.writeEndArray();
            }
            gen.writeEndArray();

            int numHoles = polygon.getNumInteriorRing();
            for (int i = 0; i < numHoles; i++) {
                LineString hole = polygon.getInteriorRingN(i);
                gen.writeStartArray();
                for (Coordinate c : hole.getCoordinates()) {
                    gen.writeStartArray();
                    gen.writeNumber(c.getX());
                    gen.writeNumber(c.getY());
                    gen.writeEndArray();
                }
                gen.writeEndArray();
            }

            gen.writeEndArray();
            gen.writeEndObject();
        }
    }
}
